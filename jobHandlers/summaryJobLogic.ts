import prisma from "@/db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import { OpenAI } from "@/clients/openai_client";

import { s3, GetObjectCommand } from "@/clients/s3_client";

import { encoding_for_model } from "@dqbd/tiktoken";
import { summaryJobComplete_SES_Config } from "@/emails/v1/summaryJobComplete";
import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "@/clients/ses_client";
import { streamToString } from "@/utils/streamToString";

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

export async function summaryJobLogic(
  params: {
    bucket: string;
    key: string;
    language: string;
    email: string;
    originalName: string;
  },
  job: any,
  done: (err?: Error | null, result?: any) => void
) {
  try {
    console.log("processing JOB with params...", params);
    const { bucket, key, language, email, originalName } = params;
    console.log(bucket, key, language, email, originalName);
    if (!bucket || !key || !language || !email || !originalName) {
      done(new Error("Invalid Data"));
      return;
    }

    const account = await prisma.account.findFirst({
      where: {
        email: email,
        emailVerified: true,
      },
      include: {
        SummaryCredits: true,
        VectorSearchCredits: true,
      },
    });

    console.log("account", account);

    // FIND EXISTING STRIPE CUSTOMER
    const customerSearchResults = await stripe.customers.search({
      // @ts-ignore
      query: `email:\'${account.email}\'`,
    });

    if (!customerSearchResults.data[0].id) {
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
    const apiCost = (tokenCount / 1000) * 0.004; // actual cost on OpenAI site is 0.0015/1000 tokens for 4K input context && 0.002/1000 tokens for 4k output context
    const OpenAiApiCost = apiCost;
    const markup = 1.4; // 40%
    const quote: number = Number.parseFloat(
      (apiCost * markup > 0.5 ? apiCost * markup : 0.5).toFixed(2)
    );

    const accountSummaryCredits = account?.SummaryCredits?.amount;
    if (accountSummaryCredits && accountSummaryCredits > 0) {
      await prisma.summaryCredits.updateMany({
        where: {
          accountId: account.id,
        },
        data: {
          amount: accountSummaryCredits - 1,
        },
      });
    } else {
      await stripe.charges.create({
        amount: quote * 100,
        currency: "usd",
        description: `Summarization for ${bucket}/${key}`,
        customer: customerSearchResults.data[0].id,
      });
    }

    try {
      if (account) {
        await prisma.openAiCharges.create({
          data: {
            accountId: account.id,
            amount: OpenAiApiCost,
          },
        });
      }
    } catch (e) {
      console.log(e);
    }

    console.log("splitting text.*.*.");

    let parts = [text];

    while (!isPartsValid(parts)) {
      console.log("in while...");

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
        filename: originalName,
        originalCharCount: text.length,
        condensedCharCount: finalAnswer.reduce(
          (acc, element) => acc + element!.length,
          0
        ),
      },
    });

    console.log("about to send an email...");

    // Send an email
    job.progress(99);

    try {
      const emailConfig = summaryJobComplete_SES_Config(
        email,
        `${process.env.FRONTEND_HOSTNAME}/dashboard/summary?summary-id=${summaryRecord.id}`,
        language
      );
      await sesClient.send(new SendTemplatedEmailCommand(emailConfig));
      console.log("email sent");
    } catch (e) {}

    done(null, { summaryId: summaryRecord.id });

    job.progress(100);
  } catch (e: any) {
    done(new Error(e ? e.message : "Something went wrong"));
  }

  // // or give an error if error
  // done(new Error('error transcoding'));
  // // or pass it a result
  // done(null, { framerate: 29.5 /* etc... */ });
  // // If the job throws an unhandled exception it is also handled correctly
  // throw new Error('some unexpected error');
}
