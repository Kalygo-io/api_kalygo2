import fs from "fs";
import prisma from "@/db/prisma_client";
import { Tiktoken, encoding_for_model } from "@dqbd/tiktoken";
import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "@/clients/ses_client";
import { sleep } from "@/utils/sleep";
import CONFIG from "@/config";
import { convertFilesToTextFormat } from "@/utils/convertFilesToTextFormat";
import { areChunksValidForModelContext } from "@/utils/areChunksValidForModelContext";
import { p } from "@/utils/p";
import { guard_beforeRunningCustomRequest } from "../../shared/guards/guard_beforeRunningCustomRequest";
import { makeChunksSmaller } from "./makeChunksSmaller";
import { checkout } from "../../shared/checkout";
import { generateOpenAiUserChatCompletionWithExponentialBackoff } from "../../shared/generateOpenAiUserChatCompletionWithExponentialBackoff";
import { ScanningMode } from "@prisma/client";
import { guard_beforeCallingModel } from "../../shared/guards/guard_beforeCallingModel";
import config from "@/config";
import { CustomRequestCustomizations } from "@/types/CustomRequestCustomizations";
import { customRequestJobComplete_SES_Config } from "@/emails/v2/customRequestJobComplete";

const tpmDelay = 60000;

export async function eachFileInChunks(
  customizations: CustomRequestCustomizations,
  email: string,
  files: any[],
  bucket: string,
  job: any,
  locale: string,
  done: (err?: Error | null | undefined, result?: any) => void
) {
  let lastFileBeforeFailing = "";
  let lastChunkBeforeFailing = 0;
  let chunks: string[] = [];

  try {
    p("SCANNING MODE: Each File In Chunks"); // for console debugging...
    const start = Date.now(); // for timing the job
    const { prompt, model } = customizations; // extract all the customization requests
    job.progress(0); // reset the job progress to 0% at the start of each job execution

    // -v-v- CHECK IF CALLER HAS AN ACCOUNT -v-v-
    const { account, customerId } = await guard_beforeRunningCustomRequest(
      email,
      model
    );
    // -v-v- TRACK I/O TOKENS FOR BILLING -v-v-
    const encoder: Tiktoken = encoding_for_model(model);
    let inputTokens = 0;
    let outputTokens = 0;
    // -v-v- CONVERT ALL FILES TO TEXT-BASED FORMAT -v-v-
    const filesToText: {
      text: string;
      originalName: string;
    }[] = await convertFilesToTextFormat(files, bucket);
    // -v-v- THIS IS THE PROMPT PREFIX THAT WILL BE APPLIED TO EACH CHUNK OF EACH FILE -v-v-
    // prettier-ignore
    const promptPrefix = prompt;
    // const promptPrefix = HACK_testPromptPrefix()
    p(".*.*. splitting text .*.*."); // for console debugging...
    // -v-v- LOOP OVER THE TEXT-BASED VERSIONS OF EACH FILE -v-v-
    // prettier-ignore
    let summaryForEachFile: { file: string, summary: { chunk: number; chunkSummary: string }[] }[] = [];
    let tpmAccum: number = 0; // for tracking TPM ie: tokens / minute
    // prettier-ignore
    for (let fIndex = 0; fIndex < filesToText.length; fIndex++) { // processing ONE of the files at a time...
      const originalNameOfFile = filesToText[fIndex].originalName;
      lastFileBeforeFailing = originalNameOfFile // for debugging
      // prettier-ignore
      p("*** file to be processed ***", originalNameOfFile);
      // -v-v- LOGIC BELOW IS TO BREAK THE DATA IN EACH FILE INTO CHUNKS SO THAT THE PROMPT_PREFIX PLUS THE_CHUNK IS WITHIN THE MODEL INPUT TOKEN LIMIT -v-v-
      chunks = [filesToText[fIndex].text];
      while (
        !areChunksValidForModelContext(
          [`${promptPrefix} ${chunks[0]}`], // check if the file is small enough to be prepended with the PROMPT_PREFIX and not trigger input token limit
          CONFIG.models[model].context,
          encoder
        )
      ) {
        // -v-v- PROMPT_PREFIX PLUS THE_FILE IS TOO BIG SO MUST BREAK INTO SMALLER CHUNKS -v-v-
        p("in while loop..."); // for console debugging...
        let newChunks = makeChunksSmaller(chunks, promptPrefix, CONFIG.models[model].context, encoder);
        chunks = newChunks;
      }
      // -v-v- WE NOW HAVE THE FILE IN CHUNKS THAT WILL NOT EXCEED THE MODEL CONTEXT LIMIT -v-v-
      // -v-v- SO WE LOOP OVER THE CHUNKS AND STORE THE SUMMARY OF EACH CHUNK -v-v-
      let summarizedChunksOfCurrentFile: { chunk: number; chunkSummary: string; }[] = [];
      for (let i = 0; i < chunks.length; i++) {
        const prompt = `PROMPT: ${promptPrefix}

DATA: ${chunks[i]}`;
        const promptTokenCount = encoder.encode(prompt).length;

        // *** Deducting cost of INPUT TOKENS from credit balance ***
        const inputTokenCost =
          (promptTokenCount /
            config.models[model].pricing.input.perTokens) *
          config.models[model].pricing.input.rate;
        console.log(
          "Cost of processing INPUT_TOKENS - now deducting from credits balance...",
          inputTokenCost,
          account?.UsageCredits?.amount
        );

        // ***
        if (!account?.CustomRequestCredits?.amount) {
          await prisma.usageCredits.update({
            data: {
              amount: {
                decrement: inputTokenCost * 100, // * 100 as Usage credits are denominated in pennies
              },
            },
            where: {
              accountId: account?.id,
            },
          });
        }
        // ***

        inputTokens += promptTokenCount; // track input tokens
        tpmAccum += promptTokenCount; // accumulate input tokens
        p(`token length of prompt for chunk ${i}`, promptTokenCount);
        p("inputTokens", inputTokens);
        p("outputTokens", outputTokens);
        p("tpmAccum", tpmAccum);
        // -v-v- IF WE NOW HAVE EXCEEDED THE TOKENS / MINUTE LIMIT WE WILL PAUSE -v-v-
        // prettier-ignore
        if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) { // tpmBuffer is to control how close to the rate limit you want to get
          await sleep(tpmDelay);
          tpmAccum = 0;
        }
        // prettier-ignore
        p(`calling OpenAI to summarize chunk ${i} of file ${originalNameOfFile}...`);
        lastChunkBeforeFailing = i

        // -v-v- GUARD AND CONFIRM THAT BALANCE WILL NOT GET OVERDRAWN
        guard_beforeCallingModel(email, model);
        
        // -v-v- CALL THE A.I. MODEL -v-v-
        const completion = await generateOpenAiUserChatCompletionWithExponentialBackoff(model, prompt, tpmDelay, `chunk${i}`)
        const completionText: string = completion.data?.choices[0]?.message?.content || "ERROR: No Content"
        // prettier-ignore
        p(`snippet of last OpenAI completion - '${completionText.slice(0,16)}'`);
        // prettier-ignore
        // -v-v- TRACK THE OUTPUT TOKENS -v-v-
        const outputTokenCount = encoder.encode(completionText).length;
        // *** Deducting cost of OUTPUT_TOKENS from credit balance ***
        const outputTokenCost =
          (outputTokenCount / config.models[model].pricing.output.perTokens) *
          config.models[model].pricing.output.rate;
        console.log(
          "Cost of OUTPUT_TOKENS - now deducting from credits balance...",
          outputTokenCost,
          account?.UsageCredits?.amount
        );

        // ***
        if (!account?.CustomRequestCredits?.amount) {
          const updatedAccountCreditsAmount = await prisma.usageCredits.update({
            data: {
              amount: {
                decrement: outputTokenCost * 100, // * 100 as Usage credits are denominated in pennies
              },
            },
            where: {
              accountId: account?.id,
            },
          });
        
          if (
            updatedAccountCreditsAmount.amount <
            config.models[model].minimumCreditsRequired
          ) {
            throw new Error("402");
          }
        }
        outputTokens += outputTokenCount; // track output tokens
        tpmAccum += outputTokenCount; // accumulate output tokens
        // -v-v- STORE THE COMPLETION OF EACH CHUNK OF THE FILE -v-v-
        // prettier-ignore
        summarizedChunksOfCurrentFile.push({ chunk: i, chunkSummary: completionText });
        p("job.progress()", job.progress()); // for console debugging
        p("i", i, "chunks.length", chunks.length); // for console debugging
        // prettier-ignore
        p(`this collection of chunks represents ${Math.floor(100 / files.length)}% of the total progress`); // for console debugging
        // prettier-ignore
        job.progress(job.progress() + ((1 / chunks.length) * (100 / files.length))); // UPDATE THE PROGRESS BAR
        p("after job.progress() update", job.progress());
      }
      // -v-v- BUILD THE FINAL ANSWER THE CALLER WANTS -v-v-
      // prettier-ignore
      summaryForEachFile.push({ file: filesToText[fIndex].originalName, summary: summarizedChunksOfCurrentFile, });
    }
    // -v-v- SAVE THE FINAL ANSWER TO DB -v-v-
    p("saving completionForEachFile to DB...");
    const timeFinalSummaryWasGenerated = Date.now(); // to help provide a tts aka time-to-summary quote
    // prettier-ignore
    console.log(`Execution time: ${timeFinalSummaryWasGenerated - start} ms or ${(timeFinalSummaryWasGenerated - start) / 1000 / 60} minutes`);
    const customRequestRecord = await prisma.customRequest.create({
      data: {
        requesterId: account!.id,
        files: files,
        bucket: bucket,
        prompt: prompt,
        mode: ScanningMode.EACH_FILE_IN_CHUNKS,
        model: model,
        completionResponse: summaryForEachFile,
      },
    });
    // -v-v- SEND AN EMAIL NOTIFICATION -v-v-
    p("send email notification...");
    try {
      const emailConfig = customRequestJobComplete_SES_Config(
        email,
        `${process.env.FRONTEND_HOSTNAME}/dashboard/custom-request-result?custom-request-id=${customRequestRecord.id}`,
        locale
      );
      await sesClient.send(new SendTemplatedEmailCommand(emailConfig));
      p("email sent");
    } catch (e) {}
    // -v-v- CHARGE THE CALLER FOR THE FANTASTIC SERVICE -v-v-
    p("*** CHECKOUT ***");
    await checkout(
      inputTokens,
      outputTokens,
      CONFIG.models[model].pricing,
      account,
      "usd",
      "Custom Request",
      customerId
    );
    job.progress(100);
    p("DONE");
    const end = Date.now();
    // prettier-ignore
    console.log(`Execution time: ${end - start} ms or ${(end - start) / 1000 / 60} minutes`);
    done(null, { customRequestId: customRequestRecord.id });
  } catch (e) {
    p("ERROR", (e as Error).toString());

    if (process.env.NODE_ENV !== "production") fs.open;
    fs.writeFileSync(
      `${__dirname}/../../../../debugQueue/failed.txt`,
      chunks.join(),
      {
        encoding: "utf8",
        flag: "w",
        mode: 0o655,
      }
    );

    done(e as Error, {
      lastFileBeforeFailing,
      lastChunkBeforeFailing,
    });
  }
}
