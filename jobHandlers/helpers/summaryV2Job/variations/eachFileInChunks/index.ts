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
import { generatePromptPrefix } from "./generatePromptPrefix";
import { sleep } from "@/utils/sleep";
import CONFIG from "@/config";

function arePartsValidForModelInputLimit(
  parts: string[],
  modelContextLimit: number,
  enc: Tiktoken
): boolean {
  for (let i = 0; i < parts.length; i++) {
    if (enc.encode(parts[i]).length > modelContextLimit) return false;
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
  done: (err?: Error | null | undefined, result?: any) => void,
  model: "gpt-3.5-turbo" | "gpt-4" = "gpt-3.5-turbo"
) {
  console.log("summarizeEachFileInChunks"); // for console debugging...
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
      let pdfByteArray = await Body?.transformToByteArray();
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
  // -v-v- THIS IS THE PROMPT PREFIX THAT WILL BE APPLIED TO EACH CHUNK OF EACH FILE -v-v-
  const promptPrefix = generatePromptPrefix({
    format: customizations.format,
    length: customizations.length,
    language: customizations.language,
  });
  console.log(".*.*. splitting text .*.*."); // for console debugging...
  // -v-v- LOOP OVER THE TEXT-BASED VERSIONS OF EACH FILE -v-v-
  let finalAnswerForEachFile: any[] = [];
  let tpmAccum: number = 0; // for tracking TPM ie: tokens / minute
  for (let fIndex = 0; fIndex < filesToText.length; fIndex++) {
    const originalNameOfFile = filesToText[fIndex].originalName;
    // prettier-ignore
    console.log("*** file to be processed ***", originalNameOfFile);
    // -v-v- LOGIC BELOW IS TO BREAK THE DATA IN EACH FILE INTO CHUNKS SO THAT THE PROMPT_PREFIX PLUS THE_CHUNK IS WITHIN THE MODEL INPUT TOKEN LIMIT -v-v-
    let parts = [filesToText[fIndex].text];
    while (
      !arePartsValidForModelInputLimit(
        [`${promptPrefix} ${parts[0]}`], // check if the file is small enough to be prepended with the PROMPT_PREFIX and not trigger input token limit
        CONFIG.models[model].context,
        enc
      )
    ) {
      // -v-v- PROMPT_PREFIX PLUS THE_FILE IS TOO BIG SO MUST BREAK INTO CHUNKS -v-v-
      console.log("in while loop..."); // for console debugging...
      let newParts = [];
      for (let i = 0; i < parts.length; i++) {
        const promptWithDataChunk = `${promptPrefix} ${parts[i]}`;
        if (
          enc.encode(promptWithDataChunk).length > CONFIG.models[model].context
        ) {
          let middle = Math.floor(parts[i].length / 2);
          let before = middle;
          let after = middle + 1;
          if (middle - before < after - middle) {
            middle = before;
          } else middle = after;
          const s1 = parts[i].substring(0, middle);
          const s2 = parts[i].substring(middle + 1);
          newParts.push(s1, s2);
        } else newParts.push(parts[i]);
      }
      parts = newParts;
    }

    // -v-v- WE NOW HAVE THE FILE IN CHUNKS THAT WILL NOT EXCEED THE MODEL CONTEXT LIMIT -v-v-
    let summarizedChunksOfCurrentFile: any = [];
    for (let i = 0; i < parts.length; i++) {
      const prompt = `${promptPrefix} ${parts[i]}`;

      const promptTokenCount = enc.encode(prompt).length;
      inputTokens += promptTokenCount; // track input tokens
      tpmAccum += promptTokenCount; // accumulate input tokens

      console.log(`token length of prompt for part ${i}`, promptTokenCount);
      console.log("tpmAccum", tpmAccum);

      // -v-v- WE NOW HAVE EXCEEDED THE TOKENS / MINUTE LIMIT SO WILL PAUSE FOR 1 MINUTE -v-v-
      // prettier-ignore
      if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) { // tpmBuffer is to control how close to the rate limit you want to get
        await sleep(60000);
        tpmAccum = 0;
      }

      console.log(
        `calling OpenAI to summarize part ${i} of file ${originalNameOfFile}...`
      );

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

      // prettier-ignore
      console.log(`snippet of last OpenAI completion - '${completion.data?.choices[0]?.message?.content?.slice(0,16)}'`);

      const outputTokenCount = enc.encode(
        completion.data?.choices[0]?.message?.content || "ERROR: No Content"
      ).length;
      outputTokens += outputTokenCount; // track output tokens
      tpmAccum += outputTokenCount; // accumulate output tokens

      // -v-v- STORE THE COMPLETION OF EACH CHUNK OF THE FILE -v-v-
      summarizedChunksOfCurrentFile.push({
        part: i,
        completionResponse:
          completion.data?.choices[0]?.message?.content || "ERROR: No Content",
      });

      console.log("job.progress()", job.progress()); // for console debugging
      console.log("i", i, "parts.length", parts.length); // for console debugging
      console.log(
        `this collection of parts represents ${Math.floor(
          100 / files.length
        )}% of the total progress`
      ); // for console debugging

      // -v-v- UPDATE THE PROGRESS BAR -v-v-
      job.progress(
        job.progress() + Math.floor((1 / parts.length) * (100 / files.length))
      );

      console.log("after job.progress() update", job.progress());
    }

    // -v-v- BUILD THE FINAL ANSWER THE CALLER WANTS -v-v-
    finalAnswerForEachFile.push({
      file: filesToText[fIndex].originalName,
      response: summarizedChunksOfCurrentFile,
    });
  }

  // -v-v- SAVE THE FINAL ANSWER TO DB -v-v-
  console.log("saving finalAnswerForEachFile to DB...");
  const summaryV2Record = await prisma.summaryV2.create({
    data: {
      requesterId: account!.id,
      // files: files,
      // bucket: bucket,
      prompt: promptPrefix,
      completionResponse: finalAnswerForEachFile,
    },
  });

  // -v-v- SEND AN EMAIL NOTIFICATION -v-v-
  console.log("send email notification...");
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
      amount: amountToChargeCaller * 100, // '* 100' is because Stripe goes by pennies
      currency: "usd",
      description: `SummaryV2`,
      customer: account?.stripeId,
    });
  }

  job.progress(100);

  console.log("DONE");
  done(null, { summaryV2Id: summaryV2Record.id });
}
