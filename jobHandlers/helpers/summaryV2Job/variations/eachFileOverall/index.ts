import prisma from "@/db/prisma_client";
import { s3, GetObjectCommand } from "@/clients/s3_client";
import { convertPDFToTxtFile } from "@/jobHandlers/helpers/customRequestJob/pdf2txt";
import { streamToString } from "@/utils/streamToString";
import { Tiktoken, encoding_for_model } from "@dqbd/tiktoken";
import { stripe } from "@/clients/stripe_client";
import { OpenAI } from "@/clients/openai_client";
import { summaryJobComplete_SES_Config } from "@/emails/summaryJobComplete";
import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "@/clients/ses_client";
import { SummarizationTypes } from "@/types/SummarizationTypes";
import { generateBulletPointsPromptPrefix } from "./generateBulletPointsPromptPrefix";
import { generatePromptPrefix } from "./generatePromptPrefix";
import { sleep } from "@/utils/sleep";
import CONFIG from "@/config";

function isNextPartValid(
  part: string,
  modelContextLimit: number,
  enc: Tiktoken
): boolean {
  if (enc.encode(part).length > modelContextLimit) return false;
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
  done: (err?: Error | null | undefined, result?: any) => void,
  model: "gpt-3.5-turbo" | "gpt-4" = "gpt-3.5-turbo"
) {
  // -v-v- ENTRY POINT - EACH FILE OVERALL -v-v-
  console.log("Summarize Each File Overall"); // for console debugging...
  // -v-v- CHECK IF CALLER HAS AN ACCOUNT -v-v-
  const account = await prisma.account.findFirst({
    where: {
      email: email,
      emailVerified: true,
    },
    include: {
      SummaryCredits: true,
    },
  });
  // -v-v- GUARD IF NO ACCOUNT FOUND -v-v-
  if (!account?.stripeId) {
    done(new Error("402"), null);
    return;
  }
  // -v-v- TRACK I/O TOKENS FOR BILLING -v-v-
  const enc: Tiktoken = encoding_for_model(model);
  let inputTokens = 0;
  let outputTokens = 0;
  const filesToText: {
    text: string;
    originalName: string;
  }[] = [];
  // -v-v- CONVERT ALL FILES TO TEXT-BASED FORMAT -v-v-
  for (let fIndex = 0; fIndex < files.length; fIndex++) {
    console.log("file", files[fIndex].originalname); // for console debugging...
    // -v-v- DOWNLOAD EACH FILE FROM S3 -v-v-
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: files[fIndex].key,
    });
    const { Body } = await s3.send(command);
    let text;
    if (files[fIndex].mimetype === "application/pdf") {
      // -v-v- IF PDF, THEN CONVERT TO TEXT -v-v-
      const pdfByteArray = await Body?.transformToByteArray();
      text = await convertPDFToTxtFile(pdfByteArray);
    } else {
      // -v-v- IF TEXT, THEN SIMPLY DOWNLOAD IT -v-v-
      text = (await streamToString(Body)) as string;
    }
    // -v-v- BUILD AN ARRAY OF THE TEXT-BASED VERSIONS OF EACH FILE -v-v-
    filesToText.push({
      text,
      originalName: files[fIndex].originalname,
    });
  }
  console.log("splitting text.*.*."); // for console debugging...
  // -v-v- LOOP OVER THE TEXT-BASED VERSIONS OF EACH FILE -v-v-
  let finalCompletionsForEachFile: any[] = [];
  let tpmAccum: number = 0; // for tracking TPM ie: tokens / minute
  for (let fIndex = 0; fIndex < filesToText.length; fIndex++) {
    const originalNameOfFile = filesToText[fIndex].originalName;
    // prettier-ignore
    console.log("*** file to be processed ***", originalNameOfFile);
    // -v-v- LOGIC BELOW IS TO BREAK THE DATA IN EACH FILE INTO CHUNKS SO THAT THE PROMPT_PREFIX PLUS THE_CHUNK IS WITHIN THE MODEL INPUT TOKEN LIMIT -v-v-
    let parts = [filesToText[fIndex].text];
    let partsCounter = 0;
    let summaryForFile = ""; // ***
    let tokenAccumWithoutPrefixForFile: number = 0;
    const totalTokenCountInFile: number = enc.encode(parts[0]).length;

    // -v-v- IF A CHUNK OF THE FILE IS TOO LARGE FOR THE MODEL'S INPUT CONTEXT... -v-v-
    // -v-v- WE WILL SHIFT IT OFF THE PARTS ARRAY AND UNSHIFT IT BACK ON BROKEN IN HALF. -v-v-
    // -v-v- WE WILL BE SEQUENTIALLY MOVING THROUGH THE FILE DATA AND INCLUDING... -v-v-
    // -v-v- THE COMPLETION OF PREVIOUSLY PROCESSED PARTS WITH EACH SUBSEQUENT PROMPT. -v-v-
    while (parts.length > 0) {
      console.log("processing next chunk of the file..."); // for console debugging...
      // -v-v- THIS IS THE PROMPT PREFIX THAT WILL BE APPLIED TO EACH CHUNK OF EACH FILE. -v-v-
      // -v-v- IT WILL INCLUDE THE COMPLETION OF PREVIOUSLY PROCESSED PARTS IN ORDER TO HELP REFINE AN OVERALL COMPLETION. -v-v-
      let promptPrefix = generatePromptPrefix(
        {
          format: "paragraph",
          length: customizations.length,
          language: customizations.language,
        },
        summaryForFile // ***
      );
      // -v-v- LOGIC IS TO CHECK THAT THE PROMPT_PREFIX PLUS THE_CHUNK IS WITHIN THE MODEL INPUT TOKEN LIMIT -v-v-
      while (
        !isNextPartValid(
          `${promptPrefix} ${parts[0]}`,
          CONFIG.models[model].context,
          enc
        )
      ) {
        // prettier-ignore
        console.log("breaking up next chunk of file as it is too large for model context..."); // for console debugging...
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

      // -v-v- WE HAVE NOW BIT OFF AN ACCEPTABLE CHUNK -v-v-
      tokenAccumWithoutPrefixForFile = enc.encode(parts[0]).length;

      console.log("WE HAVE NOW BIT OFF AN ACCEPTABLE CHUNK"); // for console debugging...
      const nextPrompt = `${promptPrefix} ${parts[0]}`;
      // prettier-ignore
      console.log("snippet of the next prompt up for completion...", nextPrompt.slice(0, 16));

      const nextPromptTokenCount = enc.encode(nextPrompt).length;
      partsCounter += 1;
      inputTokens += nextPromptTokenCount; // track input tokens
      tpmAccum += nextPromptTokenCount; // accumulate input tokens
      console.log(
        `token length of prompt for next part ${partsCounter} of file`,
        nextPromptTokenCount
      );
      console.log("tpmAccum", tpmAccum);

      // -v-v- WE NOW HAVE EXCEEDED THE TOKENS / MINUTE LIMIT SO WILL PAUSE FOR 1 MINUTE -v-v-
      // prettier-ignore
      if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) { // tpmBuffer is to control how close to the rate limit you want to get
        await sleep(60000);
        tpmAccum = 0;
      }
      // -v-v- CALL THE A.I. MODEL -v-v-
      const completion = await OpenAI.createChatCompletion({
        model,
        messages: [
          {
            role: "user",
            content: nextPrompt,
          },
        ],
        temperature: 0,
      });
      // prettier-ignore
      const completionText = completion.data?.choices[0]?.message?.content || "No Content"
      // prettier-ignore
      console.log(`snippet of last OpenAI completion - '${completionText.slice(0,16)}'`);
      // -v-v- TRACK THE OUTPUT TOKENS -v-v-
      const outputTokenCount = enc.encode(completionText).length;
      outputTokens += outputTokenCount; // track output tokens
      tpmAccum += outputTokenCount; // accumulate output tokens
      // -v-v- STORING THE COMPLETION SO IT CAN BE INCORPORATED INTO THE NEXT PROMPT -v-v-
      summaryForFile = completionText;
      // -v-v- UPDATE PROGRESS BAR -v-v-
      // prettier-ignore
      console.log("tokenAccumWithoutPrefixForFile", tokenAccumWithoutPrefixForFile); // for console debugging...
      // prettier-ignore
      console.log("totalTokenCountInFile", totalTokenCountInFile); // for console debugging...
      // prettier-ignore
      job.progress(job.progress() + Math.floor((tokenAccumWithoutPrefixForFile / totalTokenCountInFile) * (90 / files.length)));
      // -v-v- MOVE ON TO NEXT CHUNK OF THE FILE TO SYNTHESIZE INTO AN OVERALL SUMMARY -v-v-
      parts.shift();
    }

    // TODO: recursively breakup summary in case it is too large for final prompt
    if (customizations.format === "bullet-points") {
      let bulletPointsPromptPrefix = generateBulletPointsPromptPrefix(
        { length: customizations.length, language: customizations.language },
        summaryForFile
      );
      const finalBulletPointsPrompt = `${bulletPointsPromptPrefix} ${parts[0]}`;
      const finalBulletPointsPromptTokenCount = enc.encode(
        finalBulletPointsPrompt
      ).length;

      // prettier-ignore
      console.log("finalBulletPointsPromptTokenCount", finalBulletPointsPromptTokenCount); // for console debugging...

      tpmAccum += finalBulletPointsPromptTokenCount;
      if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) {
        // tpmBuffer is to control how close to the rate limit you want to get
        await sleep(60000);
        tpmAccum = 0;
      }

      const completion = await OpenAI.createChatCompletion({
        model,
        messages: [
          {
            role: "user",
            content: finalBulletPointsPrompt,
          },
        ],
        temperature: 0,
      });

      const finalBulletPointsCompletionText =
        completion.data?.choices[0]?.message?.content || "ERROR: No Content";
      // prettier-ignore
      console.log("snippet of completion of final bullet points generation request", finalBulletPointsCompletionText.slice(0, 16));
      summaryForFile = finalBulletPointsCompletionText;
    }

    // -v-v- STORE OVERALL SUMMARY OF FILE -v-v-
    let finalCompletionForCurrentFile: [
      {
        part: number;
        completionResponse: any;
      }
    ] = [
      {
        part: 0,
        completionResponse: summaryForFile,
      },
    ];
    // -v-v- BUILD THE FINAL ANSWER THE CALLER WANTS -v-v-
    finalCompletionsForEachFile.push({
      file: filesToText[fIndex].originalName,
      response: finalCompletionForCurrentFile,
    });
  }
  // -v-v- SAVE THE FINAL ANSWER TO DB -v-v-
  console.log("saving to db...");
  const summaryV2Record = await prisma.summaryV2.create({
    data: {
      requesterId: account!.id,
      // files: files,
      // bucket: bucket,
      prompt: SummarizationTypes.EachFileOverall,
      completionResponse: finalCompletionsForEachFile,
    },
  });

  // -v-v- SEND AN EMAIL NOTIFICATION -v-v-
  console.log("send an email notification...");
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

  // -v-v- CHARGE THE CALLER FOR THE FANTASTIC SERVICE -v-v-
  console.log("*** CHECKOUT ***");
  console.log("inputTokens", inputTokens);
  console.log("outputTokens", outputTokens);
  let _3rdPartyCharges = 0;
  _3rdPartyCharges +=
    (inputTokens / CONFIG.models[model].pricing.input.perTokens) *
    CONFIG.models[model].pricing.input.rate; // ie: OpenAI input token rate for API
  _3rdPartyCharges +=
    (outputTokens / CONFIG.models[model].pricing.input.perTokens) *
    CONFIG.models[model].pricing.output.rate; // ie: OpenAI output token rate for API

  // -v-v- SUMMARY OF 3rd PARTY CHARGES -v-v-
  console.log("_3rdPartyCharges", _3rdPartyCharges);

  // -v-v- MARKUP THE 3rd PARTY CHARGES -v-v-
  const markup = CONFIG.models[model].pricing.markUp;
  let amountToChargeCaller = (_3rdPartyCharges * 1.029 + 0.3) * markup; // Stripe charges 2.9% + 30¢ to run the card
  // prettier-ignore
  amountToChargeCaller = amountToChargeCaller < 0.5 ? 0.5 : amountToChargeCaller; // Stripe has a minimum charge of 50¢ USD

  console.log("amountToChargeCaller", amountToChargeCaller); // for console debugging
  const summaryCredits = account?.SummaryCredits?.amount;
  if (summaryCredits && summaryCredits > 0) {
    console.log("paid for with free credit...");
    await prisma.summaryCredits.updateMany({
      where: {
        accountId: account.id,
      },
      data: {
        amount: summaryCredits - 1,
      },
    });
  } else {
    console.log("charging card via Stripe...");
    await stripe.charges.create({
      amount: Math.floor(amountToChargeCaller * 100), // '* 100' is because Stripe goes by pennies
      currency: "usd",
      description: `SummaryV2`,
      customer: account?.stripeId,
    });
  }

  job.progress(100);
  console.log("DONE");
  done(null, { summaryV2Id: summaryV2Record.id });
}
