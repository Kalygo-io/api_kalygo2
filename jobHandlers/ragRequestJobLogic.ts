import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";
import { SupportedReplicateModels } from "@/types/SupportedReplicateModels";
import prisma from "@/db/prisma_client";
import { convertFilesToTextFormat } from "@/utils/convertFilesToTextFormat";
import { chromaClient } from "@/clients/chroma_client";
import crypto from "crypto";
import { OpenAIEmbeddingFunction } from "chromadb";
import { ragJobComplete_SES_Config } from "@/emails/v1/ragJobComplete";
import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "@/clients/ses_client";
import { generateOpenAiUserChatCompletionWithExponentialBackoff } from "./helpers/ragRequestJob/shared/generateOpenAiUserChatCompletionWithExponentialBackoff";
import { generateRagPromptPrefix } from "./helpers/ragRequestJob/shared/generatePromptPrefix";
import csvtojson from "csvtojson";
import { checkout } from "./helpers/ragRequestJob/shared/checkout";
import { guard_beforeRunningRagRequest } from "./helpers/ragRequestJob/shared/guards/guard_beforeRunningRagRequest";

const tpmDelay = 60000;

const embedder = new OpenAIEmbeddingFunction({
  openai_api_key: process.env.OPENAI_API_KEY!,
});

export async function ragRequestJobLogic(
  params: {
    file: any;
    email: string;
    customizations: {
      model: SupportedOpenAiModels;
      prompt: string;
    };
    locale: string;
  },
  job: any,
  done: (err?: Error | null, result?: any) => void
) {
  try {
    console.log("processing ragRequestJobLogic with params...", params);

    job.progress(10);

    console.log("processing JOB with params *!*!*", params);

    const {
      customizations: { model, prompt },
      file,
      email,
      locale,
    } = params;

    console.log(model, prompt, file, email, locale);

    if (!model || !prompt || !file || !email || !locale) {
      done(new Error("Invalid Data"));
      return;
    }

    console.log("fetch account");

    // const account = await prisma.account.findFirst({
    //   where: {
    //     email: email,
    //   },
    //   include: {
    //     VectorSearchCredits: true,
    //   },
    // });

    // -v-v- CHECK IF CALLER HAS AN ACCOUNT -v-v-
    const { account, customerId } = await guard_beforeRunningRagRequest(
      email,
      model
    );

    console.log("account -> w/ credits info ->", account);

    const filesToText: {
      text: string;
      originalName: string;
    }[] = await convertFilesToTextFormat([file], file.bucket);

    const kbArray = await csvtojson({
      noheader: true,
      output: "csv",
    }).fromString(filesToText[0].text);

    console.log(filesToText[0].text.length);

    if (kbArray.length > 100 || filesToText[0].text.length > 10000)
      throw new Error(
        "Knowledge base limited to 100 rows or 10,000 characters"
      );

    const chunks: string[] = [];
    const metadata: any[] = [];
    const ids: string[] = [];

    for (let i = 1; i < kbArray.length; i++) {
      // console.log("kbArray[i]", kbArray[i]);
      chunks.push(kbArray[i][0]);
      metadata.push({
        answer: kbArray[i][1],
      });
      ids.push(i.toString());
    }

    const shasum = crypto.createHash("sha1");
    shasum.update(email);
    const hashIdOfText = shasum.digest("hex");
    console.log("hashIdOfText", hashIdOfText);

    try {
      await chromaClient.deleteCollection({
        name: hashIdOfText,
      });
    } catch (e) {}

    const test_collection = await chromaClient.createCollection({
      name: hashIdOfText,
      embeddingFunction: embedder,
    });

    await test_collection.add({
      ids: ids,
      metadatas: metadata,
      documents: chunks,
    });

    const results = await test_collection.query({
      nResults: 3,
      queryTexts: [prompt],
    });

    try {
      await chromaClient.deleteCollection({
        name: hashIdOfText,
      });
    } catch (e) {}

    // console.log("results", results);

    const relevantQnAs = results.documents[0]?.map((val, index) => {
      return {
        question: val || "ERROR",
        answer: results.metadatas[0][index]?.answer?.toString() || "ERROR",
      };
    });

    const promptPrefix = generateRagPromptPrefix(relevantQnAs, prompt);

    // -v-v- CALL THE A.I. MODEL -v-v-
    let completion =
      await generateOpenAiUserChatCompletionWithExponentialBackoff(
        model,
        `CONTEXT:\n${promptPrefix}\nPROMPT:\n${prompt}`,
        tpmDelay
      );
    // prettier-ignore
    const completionText = completion.data?.choices[0]?.message?.content || "No Content"

    const ragRequestRecord = await prisma.ragRequest.create({
      data: {
        requesterId: account!.id,
        filename: file.originalName,
        bucket: file.bucket,
        bucketKey: file.key,
        prompt: `CONTEXT:\n${promptPrefix}\n\nPROMPT:\n${prompt}`,
        completion: completionText,
      },
    });

    await prisma.prompt.create({
      data: {
        ownerId: account!.id,
        prompt: prompt,
      },
    });

    console.log("about to send an email...");

    // Send an email
    job.progress(50);

    try {
      const emailConfig = ragJobComplete_SES_Config(
        email,
        `${process.env.FRONTEND_HOSTNAME}/dashboard/rag-request-result?rag-request-id=${ragRequestRecord.id}`, // TODO
        locale
      );
      await sesClient.send(new SendTemplatedEmailCommand(emailConfig));
      console.log("Email sent");
    } catch (e) {}

    job.progress(99);

    await checkout(
      // inputTokens,
      // outputTokens,
      // CONFIG.models[model].pricing,
      account
      // "usd",
      // "SummaryV2",
      // customerId
    );

    job.progress(100);

    done(null, {
      ragRequestId: ragRequestRecord.id,
    });
  } catch (e: any) {
    done(new Error(e ? e.message : "Something went wrong"));
  }
}
