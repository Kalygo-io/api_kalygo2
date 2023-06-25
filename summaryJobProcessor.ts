import Queue from "bull";
import prisma from "@/db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import { OpenAI } from "@/clients/openai_client";

import { s3Client, s3, GetObjectCommand } from "@/clients/s3_client";

import { encoding_for_model } from "@dqbd/tiktoken";
import { summaryJobComplete_SES_Config } from "./emails/summaryJobComplete";
import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "./clients/ses_client";

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

export const summarizationJobQueue = new Queue(
  "summarization",
  "redis://127.0.0.1:6379"
);

const PROMPT_PREFIX = (
  lng: string
) => `Please provide a detailed summary of the following ORIGINAL_TEXT
              
  The summary should be:
  
  - Written in ${lng}
  - Grammatically correct
  - Have professional punctuation
  - Be accurate
  - In cases where accuracy is not possible please provide a disclaimer
        
  Here is the ORIGINAL_TEXT:`;

const streamToString = (stream: any) =>
  new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on("data", (chunk: any) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });

summarizationJobQueue.process(async function (job, done) {
  console.log("processing JOB...", job.data);
  const { bucket, key, language, email, originalName } = job.data;
  console.log(bucket, key, language, email, originalName);

  if (!bucket || !key || !language || !email || !originalName) {
    console.log(
      "Invalid Data",
      !bucket || !key || !language || !email || !originalName
    );

    done(new Error("Invalid Data"));
    return;
  }

  const account = await prisma.account.findFirst({
    where: {
      email: email,
    },
  });

  console.log("account", account);

  if (!account?.stripeId) {
    done(new Error("402"));
    return;
  }

  // download file from S3
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const { Body } = await s3.send(command);
  const text = (await streamToString(Body)) as string;

  const tokenCount: number = enc.encode(text).length;
  const apiCost = (tokenCount / 1000) * 0.007;
  const markup = 1.4; // 40%
  const quote: number = Number.parseFloat(
    (apiCost * markup > 0.5 ? apiCost * markup : 0.5).toFixed(2)
  );

  await stripe.charges.create({
    amount: quote * 100,
    currency: "usd",
    description: `Summarization for ${bucket}/${key}`,
    customer: account?.stripeId,
  });

  console.log("splitting text...");

  let parts = [text];

  while (!isPartsValid(parts)) {
    let newParts = [];

    for (let i = 0; i < parts.length; i++) {
      const prompt = PROMPT_PREFIX(language) + parts[i];

      if (enc.encode(prompt).length > 4000) {
        let middle = Math.floor(prompt.length / 2);
        // let before = prompt.lastIndexOf(" ", middle);
        // let after = prompt.indexOf(" ", middle + 1);
        let before = middle;
        let after = middle + 1;

        if (middle - before < after - middle) {
          middle = before;
        } else middle = after;

        const s1 = prompt.substring(0, middle);
        const s2 = prompt.substring(middle + 1);

        newParts.push(s1, s2);
      } else newParts.push(parts[i]);
    }

    parts = newParts;
  }

  console.log("splitting text DONE");

  let finalAnswer = [];
  let tokenAccum: number = 0;
  console.log("parts.length", parts.length);

  for (let i = 0; i < parts.length; i++) {
    const prompt = `${PROMPT_PREFIX(language)} ${parts[i]}`;

    tokenAccum += enc.encode(prompt).length;

    console.log("part", i);
    console.log("token length of part", enc.encode(prompt).length);
    console.log("tokenAccum", tokenAccum);

    if (tokenAccum > 4000) {
      await sleep(60000);
      tokenAccum = 0;
    }

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

    finalAnswer.push(completion.data?.choices[0]?.message?.content);

    // console.log("i", i, "parts.length", parts.length);
    // console.log("progress", Math.floor((i / parts.length) * 100));

    job.progress(Math.floor((i / parts.length) * 100));
  }

  const summaryRecord = await prisma.summary.create({
    data: {
      requesterId: account!.id,
      content: finalAnswer.join("\n\n"),
      originalFileName: originalName,
      originalCharCount: text.length,
      condensedCharCount: finalAnswer.reduce(
        (acc, element) => acc + element!.length,
        0
      ),
    },
  });

  // Send an email

  job.progress(100);

  try {
    const emailConfig = summaryJobComplete_SES_Config(
      email,
      `${process.env.FRONTEND_HOSTNAME}/dashboard/summary?summary-id=${summaryRecord.id}`
    );
    await sesClient.send(new SendTemplatedEmailCommand(emailConfig));
  } catch (e) {}

  done(null, { summaryId: summaryRecord.id });

  // // or give an error if error
  // done(new Error('error transcoding'));
  // // or pass it a result
  // done(null, { framerate: 29.5 /* etc... */ });
  // // If the job throws an unhandled exception it is also handled correctly
  // throw new Error('some unexpected error');
});
