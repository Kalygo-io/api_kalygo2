import prisma from "@/db/prisma_client";
import { sleep } from "@/utils/sleep";
import CONFIG from "@/config";
import { areChunksValidForModelContext } from "@/utils/areChunksValidForModelContext";
import { p } from "@/utils/p";
import { guard_beforeRunningCustomRequest } from "../../../shared/guards/guard_beforeRunningCustomRequest";
import { makeChunksSmaller } from "./makeChunksSmaller";
import { checkout } from "../../../shared/checkout";
import { generateOpenAiUserChatCompletionWithExponentialBackoff } from "../../../shared/generateOpenAiUserChatCompletionWithExponentialBackoff";
import { ScanningMode } from "@prisma/client";
import { guard_beforeCallingModel } from "../../../shared/guards/guard_beforeCallingModel";
import config from "@/config";
import { CustomRequestV2OpenAiCustomizations } from "@/types/CustomRequestV2OpenAiCustomizations";
import { getEncoderForModel } from "../../../shared/getEncoderForModel";
import { convertFileToTextFormat } from "@/utils/convertFileToTextFormat";
import { saveToDb } from "./saveToDb";

const tpmDelay = 60000;

export async function openAiFileInChunks(
  customizations: CustomRequestV2OpenAiCustomizations,
  email: string,
  file: any,
  bucket: string,
  job: any,
  batchId: string,
  locale: string,
  done: (err?: Error | null | undefined, result?: any) => void
) {
  let lastFileBeforeFailing = "";
  let lastChunkBeforeFailing = 0;
  let chunks: string[] = [];

  try {
    p("SCANNING MODE: File In Chunks");
    const start = Date.now();
    const {
      prompts: { prompt, finalPrompt, overallPrompt },
      model,
    } = customizations;
    job.progress(0);

    const { account } = await guard_beforeRunningCustomRequest(email, model);
    const encoder = getEncoderForModel(model);
    let inputTokens = 0;
    let outputTokens = 0;
    const fileToText: {
      text: string;
      originalName: string;
    } = await convertFileToTextFormat(file, bucket);
    const promptPrefix = prompt;
    // prettier-ignore
    let summaryForFile: { file: string, summary: { chunk: number; chunkSummary: string }[] };
    let tpmAccum: number = 0; // for tracking TPM ie: tokens / minute
    // prettier-ignore

    const originalNameOfFile = fileToText.originalName;
    lastFileBeforeFailing = originalNameOfFile; // for debugging
    // prettier-ignore
    p("*** file to be processed ***", originalNameOfFile);
    chunks = [fileToText.text];
    while (
      !areChunksValidForModelContext(
        chunks,
        CONFIG.models[model].context,
        encoder
      )
    ) {
      p("in while loop...");
      let newChunks = makeChunksSmaller(
        chunks,
        promptPrefix,
        CONFIG.models[model].context,
        encoder
      );
      chunks = newChunks;
    }
    // -v-v- WE NOW HAVE THE FILE IN CHUNKS THAT WILL NOT EXCEED THE MODEL CONTEXT LIMIT -v-v-
    // -v-v- SO WE LOOP OVER THE CHUNKS AND STORE THE SUMMARY OF EACH CHUNK -v-v-
    let summarizedChunksOfCurrentFile: {
      chunk: number;
      chunkSummary: string;
    }[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const prompt = `PROMPT: ${promptPrefix}

DATA: ${chunks[i]}`;
      const promptTokenCount = encoder.encode(prompt).length;

      // *** Deducting cost of INPUT TOKENS from credit balance ***
      const inputTokenCost =
        (promptTokenCount / config.models[model].pricing.input.perTokens) *
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
      lastChunkBeforeFailing = i;

      // -v-v- GUARD AND CONFIRM THAT BALANCE WILL NOT GET OVERDRAWN
      await guard_beforeCallingModel(email, model);

      // -v-v- CALL THE A.I. MODEL -v-v-
      const completion =
        await generateOpenAiUserChatCompletionWithExponentialBackoff(
          model,
          prompt,
          tpmDelay
        );
      const completionText: string =
        completion.data?.choices[0]?.message?.content || "ERROR: No Content";
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
      p(`this collection of chunks represents ${Math.floor(100)}% of the total progress`); // for console debugging
      // prettier-ignore
      job.progress(job.progress() + ((1 / chunks.length) * 100));
      p("after job.progress() update", job.progress());
    }

    summaryForFile = {
      file: fileToText.originalName,
      summary: summarizedChunksOfCurrentFile,
    };

    await saveToDb(account, summaryForFile, model, locale, batchId, file);

    const customRequestRecord = await prisma.customRequest.create({
      data: {
        requesterId: account!.id,
        files: file,
        bucket: bucket,
        prompt: prompt,
        mode: ScanningMode.EACH_FILE_IN_CHUNKS,
        model: model,
        completionResponse: summaryForFile,
      },
    });
    // -v-v- SAVE THE PROMPT TO DB -v-v-
    await prisma.prompt.create({
      data: {
        ownerId: account!.id,
        prompt: prompt,
      },
    });

    console.log("--- ___ ---");

    await prisma.file.create({
      data: {
        customRequestId: customRequestRecord.id,
        originalName: file.originalname,
        bucket: file.bucket,
        key: file.key,
        hash: file.etag,
        ownerId: account?.id,
      },
    });

    p("*** CHECKOUT ***");
    await checkout(
      inputTokens,
      outputTokens,
      CONFIG.models[model].pricing,
      account,
      email,
      customRequestRecord.id,
      locale
    );
    job.progress(100);
    p("DONE");
    const end = Date.now();
    // prettier-ignore
    console.log(`Execution time: ${end - start} ms or ${(end - start) / 1000 / 60} minutes`);
    done(null, { customRequestId: customRequestRecord.id });
  } catch (e) {
    done(e as Error, {
      lastFileBeforeFailing,
      lastChunkBeforeFailing,
    });
  }
}
