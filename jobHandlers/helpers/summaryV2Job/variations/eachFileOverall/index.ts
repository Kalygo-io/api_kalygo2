import prisma from "@/db/prisma_client";
import { s3, GetObjectCommand } from "@/clients/s3_client";
import { convertPDFToTxtFile } from "@/jobHandlers/helpers/customRequestJob/pdf2txt";
import { streamToString } from "@/utils/streamToString";
import { encoding_for_model } from "@dqbd/tiktoken";
import { stripe } from "@/clients/stripe_client";
import { OpenAI } from "@/clients/openai_client";
import { summaryJobComplete_SES_Config } from "@/emails/summaryJobComplete";
import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "@/clients/ses_client";
import { SummarizationTypes } from "@/types/SummarizationTypes";
import { generateBulletPointsPromptPrefix } from "./generateBulletPointsPromptPrefix";
import { generatePromptPrefix } from "./generatePromptPrefix";

const enc = encoding_for_model("gpt-3.5-turbo");

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isNextPartValid(customPrompt: string, part: string): boolean {
  if (enc.encode(customPrompt + " " + part).length > 4096) return false;
  return true;
}

export async function summarizeEachFileOverall(
  customizations: {
    format: string;
    length: string;
    language: string;
  },
  email: string,
  files: any[],
  bucket: string,
  job: any,
  done: (err?: Error | null | undefined, result?: any) => void
) {
  const account = await prisma.account.findFirst({
    where: {
      email: email,
      emailVerified: true,
    },
    include: {
      SummaryCredits: true,
    },
  });

  if (!account?.stripeId) {
    done(new Error("402"), null);
    return;
  }

  const filesToText = [];
  let totalTokenCount = 0;
  let totalApiCost = 0;

  for (let fIndex = 0; fIndex < files.length; fIndex++) {
    console.log("file", files[fIndex].originalname);

    // download file from S3
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: files[fIndex].key,
    });

    const { Body } = await s3.send(command);

    let text;
    let pdfByteArray;

    if (files[fIndex].mimetype === "application/pdf") {
      pdfByteArray = await Body?.transformToByteArray();
      text = await convertPDFToTxtFile(pdfByteArray);
    } else {
      text = (await streamToString(Body)) as string;
    }

    const tokenCount: number = enc.encode(text).length;

    totalApiCost += (tokenCount / 1000) * 0.004; // actual cost on OpenAI site is 0.0015/1000 tokens for 4K input context && 0.002/1000 tokens for 4k output context
    totalTokenCount += tokenCount;

    filesToText.push({
      text,
      tokenCount,
      originalName: files[fIndex].originalname,
    });
  }

  // TODO - Needs to be moved as last step on principle
  // console.log("totalTokenCount", totalTokenCount);
  // console.log("totalApiCost", totalApiCost);
  // const markup = 1.4; // 40%
  // const quote: number = Number.parseFloat(
  //   (totalApiCost * markup > 0.5 ? totalApiCost * markup : 0.5).toFixed(2)
  // );
  // const summaryCredits = account?.SummaryCredits?.amount;
  // if (summaryCredits && summaryCredits > 0) {
  //   await prisma.customRequestCredits.updateMany({
  //     where: {
  //       accountId: account.id,
  //     },
  //     data: {
  //       amount: summaryCredits - 1,
  //     },
  //   });
  // } else {
  //   await stripe.charges.create({
  //     amount: quote * 100,
  //     currency: "usd",
  //     description: `SummaryV2`,
  //     customer: account?.stripeId,
  //   });
  // }

  console.log("splitting text.*.*.");

  let finalAnswerForEachFile: any[] = [];
  for (let fIndex = 0; fIndex < filesToText.length; fIndex++) {
    console.log(
      "*** file to be processed ***",
      filesToText[fIndex].originalName
    );

    let parts = [filesToText[fIndex].text];
    let summaryForFile = ""; // ***
    let tokenAccum: number = 0;
    let tokenAccumWithoutPrefix: number = 0;
    const totalTokenCountInFile: number = enc.encode(parts[0]).length;

    while (parts.length > 0) {
      console.log("outer while...");

      let promptPrefix = generatePromptPrefix(
        {
          format: "paragraph",
          length: customizations.length,
          language: customizations.language,
        },
        summaryForFile // ***
      );

      while (!isNextPartValid(promptPrefix, parts[0])) {
        console.log("inner while...");
        const dataChunk = parts[0];
        let middle = Math.floor(dataChunk.length / 2);
        let before = middle;
        let after = middle + 1;

        if (middle - before < after - middle) {
          middle = before;
        } else middle = after;

        const s1 = dataChunk.substring(0, middle);
        const s2 = dataChunk.substring(middle + 1);

        parts.shift();
        parts.unshift(s1, s2);
      }

      console.log("WE HAVE NOW BIT OFF AN ACCEPTABLE CHUNK");

      // WE HAVE NOW BIT OFF AN ACCEPTABLE CHUNK
      const finalPrompt = `${promptPrefix} ${parts[0]}`;

      console.log("finalPrompt", finalPrompt);
      console.log("tokens to be sent", enc.encode(finalPrompt).length);
      console.log("totalTokenCount", totalTokenCount);

      tokenAccum += enc.encode(finalPrompt).length;
      tokenAccumWithoutPrefix += enc.encode(parts[0]).length;
      if (tokenAccum > 4000) {
        await sleep(60000);
        tokenAccum = 0;
      }

      const completion = await OpenAI.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: finalPrompt,
          },
        ],
        temperature: 0,
      });

      console.log(
        "completion of last OpenAI request",
        completion.data?.choices[0]?.message?.content
      );

      summaryForFile =
        completion.data?.choices[0]?.message?.content || "No Content";

      console.log("*** parts.length ***", parts.length);

      // vvv vvv vvv
      job.progress(
        job.progress() +
          Math.floor(
            (tokenAccumWithoutPrefix / totalTokenCountInFile) *
              (90 / files.length)
          )
      );
      // ^^^ ^^^ ^^^

      parts.shift();
    }

    if (customizations.format === "bullet-points") {
      let bulletPointsPromptPrefix = generateBulletPointsPromptPrefix(
        {
          length: customizations.length,
          language: customizations.language,
        },
        summaryForFile
      );

      const finalBulletPointsPrompt = `${bulletPointsPromptPrefix} ${parts[0]}`;

      tokenAccum += enc.encode(finalBulletPointsPrompt).length;
      if (tokenAccum > 4000) {
        await sleep(60000);
        tokenAccum = 0;
      }

      const completion = await OpenAI.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: finalBulletPointsPrompt,
          },
        ],
        temperature: 0,
      });

      console.log(
        "final completion of bullet points OpenAI request",
        completion.data?.choices[0]?.message?.content
      );

      summaryForFile =
        completion.data?.choices[0]?.message?.content || "No Content";
    }

    let finalAnswerForCurrentFile: any = [];

    finalAnswerForCurrentFile.push({
      part: 0,
      completionResponse: summaryForFile,
    });

    finalAnswerForEachFile.push({
      file: filesToText[fIndex].originalName,
      response: finalAnswerForCurrentFile,
    });
  }

  const summaryV2Record = await prisma.summaryV2.create({
    data: {
      requesterId: account!.id,
      // files: files,
      // bucket: bucket,
      prompt: SummarizationTypes.EachFileOverall,
      completionResponse: finalAnswerForEachFile,
    },
  });

  console.log("about to send an email...");

  // Send an email
  job.progress(95);

  try {
    const emailConfig = summaryJobComplete_SES_Config(
      email,
      `${process.env.FRONTEND_HOSTNAME}/dashboard/summary-v2?summary-v2-id=${summaryV2Record.id}`,
      customizations.language
    );
    await sesClient.send(new SendTemplatedEmailCommand(emailConfig));
    console.log("email sent");
  } catch (e) {}

  done(null, { summaryV2Id: summaryV2Record.id });

  // done();

  job.progress(100);
}
