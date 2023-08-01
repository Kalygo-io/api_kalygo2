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
import { generatePromptPrefix } from "./generatePromptPrefix";

const enc = encoding_for_model("gpt-3.5-turbo");

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPartsValid(parts: string[]): boolean {
  for (let i = 0; i < parts.length; i++) {
    if (enc.encode(parts[i]).length > 4096) return false;
  }

  return true;
}

export async function summarizeEachFileInChunks(
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
  const promptPrefix = generatePromptPrefix({
    format: customizations.format,
    length: customizations.length,
    language: customizations.language,
  });

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
    // console.log(
    //   "*** file to be processed ***",
    //   filesToText[fIndex].originalName
    // );

    let parts = [filesToText[fIndex].text];

    while (!isPartsValid(parts)) {
      console.log("in while...");

      let newParts = [];

      for (let i = 0; i < parts.length; i++) {
        const promptWithDataChunk = promptPrefix + parts[i]; // replace with customized prompt

        if (enc.encode(promptWithDataChunk).length > 4000) {
          let middle = Math.floor(promptWithDataChunk.length / 2);
          let before = middle;
          let after = middle + 1;

          if (middle - before < after - middle) {
            middle = before;
          } else middle = after;

          const s1 = promptWithDataChunk.substring(0, middle);
          const s2 = promptWithDataChunk.substring(middle + 1);

          newParts.push(s1, s2);
        } else newParts.push(parts[i]);
      }

      parts = newParts;
    }

    let finalAnswerForCurrentFile: any = [];
    let tokenAccum: number = 0;
    for (let i = 0; i < parts.length; i++) {
      const prompt = `${promptPrefix} ${parts[i]}`; // replace with customized prompt

      tokenAccum += enc.encode(prompt).length;

      console.log("file", filesToText[fIndex].originalName, "part", i);
      console.log("token length of part", enc.encode(prompt).length);
      console.log("tokenAccum", tokenAccum);

      if (tokenAccum > 4000) {
        await sleep(60000);
        tokenAccum = 0;
      }

      console.log("calling OpenAI...");

      console.log("with prompt...");
      // console.log(prompt);

      const completion = await OpenAI.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0,
      });

      console.log(
        "completion of last OpenAI request",
        completion.data?.choices[0]?.message?.content
      );

      finalAnswerForCurrentFile.push({
        part: i,
        completionResponse:
          completion.data?.choices[0]?.message?.content || "No Content",
      });

      // console.log("i", i, "parts.length", parts.length);
      // console.log("progress", Math.floor((i / parts.length) * 100));

      console.log("job.progress()", job.progress());
      console.log("i", i, "parts.length", parts.length);
      console.log(100 / files.length);

      job.progress(
        job.progress() + Math.floor((1 / parts.length) * (100 / files.length))
      );

      console.log("job.progress() after update", job.progress());
    }

    finalAnswerForEachFile.push({
      file: filesToText[fIndex].originalName,
      response: finalAnswerForCurrentFile,
    });
  }

  // console.log("splitting text DONE");

  // let finalAnswer = [];
  // let tokenAccum: number = 0;
  // console.log("parts.length", parts.length);

  const summaryV2Record = await prisma.summaryV2.create({
    data: {
      requesterId: account!.id,
      // files: files,
      // bucket: bucket,
      prompt: promptPrefix,
      completionResponse: finalAnswerForEachFile,
    },
  });

  console.log("about to send an email...");

  // Send an email
  // job.progress(99);

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
