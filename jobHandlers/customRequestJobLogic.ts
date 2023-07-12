import prisma from "@/db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import { OpenAI } from "@/clients/openai_client";

import { s3, GetObjectCommand } from "@/clients/s3_client";

import { encoding_for_model } from "@dqbd/tiktoken";
import { summaryJobComplete_SES_Config } from "@/emails/summaryJobComplete";
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

export async function customRequestJobLogic(
  params: {
    bucket: string;
    files: any[];
    email: string;
    customPrompt: string;
  },
  job: any,
  done: (err?: Error | null, result?: any) => void
) {
  try {
    console.log("processing JOB with params...", params);
    const { files, bucket, email, customPrompt } = params;
    console.log(bucket, files, email, customPrompt);
    if (!bucket || !files || !email || !customPrompt) {
      done(new Error("Invalid Data"));
      return;
    }

    const account = await prisma.account.findFirst({
      where: {
        email: email,
        emailVerified: true,
      },
      include: {
        CustomRequestCredits: true,
      },
    });

    // console.log("account", account);

    if (!account?.stripeId) {
      done(new Error("402"));
      return;
    }

    const filesToText = [];
    let totalTokenCount = 0;
    let totalApiCost = 0;

    for (let file of files) {
      console.log("file", file);

      // download file from S3
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: file.key,
      });

      const { Body } = await s3.send(command);
      const text = (await streamToString(Body)) as string;
      const tokenCount: number = enc.encode(text).length;
      totalApiCost += (tokenCount / 1000) * 0.0015; // actual cost on OpenAI site is 0.0015 for 4K context
      totalTokenCount += tokenCount;

      filesToText.push({
        text,
        tokenCount,
        originalName: file.originalname,
      });
    }

    console.log("totalTokenCount", totalTokenCount);
    console.log("totalApiCost", totalApiCost);
    // const markup = 1.4; // 40%
    // const quote: number = Number.parseFloat(
    //   (apiCost * markup > 0.5 ? apiCost * markup : 0.5).toFixed(2)
    // );

    // const customRequestCredits = account?.CustomRequestCredits?.amount;
    //   if (customRequestCredits && customRequestCredits > 0) {
    //     await prisma.summaryCredits.updateMany({
    //       where: {
    //         accountId: account.id,
    //       },
    //       data: {
    //         amount: customRequestCredits - 1,
    //       },
    //     });
    //   } else {
    //     await stripe.charges.create({
    //       amount: quote * 100,
    //       currency: "usd",
    //       description: `Custom Request for ${bucket}/${file.key}`,
    //       customer: account?.stripeId,
    //     });
    //   }

    console.log("splitting text.*.*.");

    let finalAnswerForEachFile: string[][] = [];
    for (let fileMetadata of filesToText) {
      let parts = [fileMetadata.text];

      while (!isPartsValid(parts)) {
        console.log("in while...");

        let newParts = [];

        for (let i = 0; i < parts.length; i++) {
          const prompt = customPrompt + parts[i];

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

      let finalAnswerForCurrentFile: string[] = [];
      let tokenAccum: number = 0;
      for (let i = 0; i < parts.length; i++) {
        const prompt = `${customPrompt} ${parts[i]}`;

        tokenAccum += enc.encode(prompt).length;

        console.log("file", fileMetadata.originalName, "part", i);
        console.log("token length of part", enc.encode(prompt).length);
        console.log("tokenAccum", tokenAccum);

        if (tokenAccum > 4000) {
          await sleep(60000);
          tokenAccum = 0;
        }

        console.log("calling OpenAI...");

        console.log("with prompt...");
        console.log(prompt);

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

        finalAnswerForCurrentFile.push(
          completion.data?.choices[0]?.message?.content || "No Content"
        );

        // console.log("i", i, "parts.length", parts.length);
        // console.log("progress", Math.floor((i / parts.length) * 100));
        // console.log("job.progress()", job.progress());

        // job.progress(
        //   job.progress() + Math.floor((i / parts.length) * (100 / files.length))
        // );
      }

      finalAnswerForEachFile.push(finalAnswerForCurrentFile);
    }

    // console.log("splitting text DONE");

    // let finalAnswer = [];
    // let tokenAccum: number = 0;
    // console.log("parts.length", parts.length);

    const customRequestRecord = await prisma.customRequest.create({
      data: {
        requesterId: account!.id,
        files: files,
        bucket: bucket,
        prompt: customPrompt,
        completionResponse: finalAnswerForEachFile,
      },
    });

    // console.log("about to send an email...");

    // Send an email
    // job.progress(99);

    // try {
    //   const emailConfig = summaryJobComplete_SES_Config(
    //     email,
    //     `${process.env.FRONTEND_HOSTNAME}/dashboard/summary?summary-id=${summaryRecord.id}`,
    //     language
    //   );
    //   await sesClient.send(new SendTemplatedEmailCommand(emailConfig));
    //   console.log("email sent");
    // } catch (e) {}

    done(null, { customRequestId: customRequestRecord.id });

    // done();

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
