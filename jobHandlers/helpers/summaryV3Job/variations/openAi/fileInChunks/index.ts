import prisma from "@/db/prisma_client";
import { summaryJobComplete_SES_Config } from "@/emails/v2/summaryJobComplete";
import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "@/clients/ses_client";
import { generatePromptPrefix } from "./generatePromptPrefix";
import { sleep } from "@/utils/sleep";
import CONFIG from "@/config";
import { areChunksValidForModelContext } from "@/utils/areChunksValidForModelContext";
import { p } from "@/utils/p";
import { guard_beforeRunningSummary } from "../../../shared/guards/guard_beforeRunningSummary";
import { makeChunksSmaller } from "./makeChunksSmaller";
import { checkout } from "../../../shared/checkout";
import { generateOpenAiUserChatCompletionWithExponentialBackoff } from "../../../shared/generateOpenAiUserChatCompletionWithExponentialBackoff";
import { guard_beforeCallingModel } from "../../../shared/guards/guard_beforeCallingModel";
import config from "@/config";
import { SummaryV3OpenAiCustomizations } from "@/types/SummaryV3OpenAiCustomizations";
import { getEncoderForModel } from "../../../shared/getEncoderForModel";
import { convertFileToTextFormat } from "@/utils/convertFileToTextFormat";
import { saveToDb } from "./saveToDb";
import { deductCostOfOpenAiInputTokens } from "../../../shared/deductCostOfOpenAiInputTokens";
import { deductCostOfOpenAiOutputTokens } from "../../../shared/deductCostOfOpenAiOutputTokens";

const tpmDelay = 60000;

export async function openAiSummarizeFileInChunks(
  customizations: SummaryV3OpenAiCustomizations,
  email: string,
  file: Record<string, any>,
  bucket: string,
  job: any,
  batchId: string,
  locale: string,
  done: (err?: Error | null | undefined, result?: any) => void
) {
  let lastChunkBeforeFailing = 0;
  let chunks: string[] = [];
  try {
    p("Summarize v3 FILE_IN_CHUNKS", batchId);
    const start = Date.now();
    let inputTokens = 0,
      outputTokens = 0;
    const { format, length, language, model, chunkTokenOverlap } =
      customizations;
    job.progress(0);
    const { account } = await guard_beforeRunningSummary(email, model);
    const encoder = getEncoderForModel(model);
    const fileToText: { text: string; originalName: string } =
      await convertFileToTextFormat(file, bucket);
    const promptPrefix = generatePromptPrefix({ format, length, language });
    // prettier-ignore
    let summaryForFile: { file: string, summary: { chunk: number; chunkSummary: string }[] };
    let tpmAccum: number = 0;
    const originalNameOfFile = fileToText.originalName;
    p("*** file to be processed ***", originalNameOfFile);
    // BREAK TEXT INTO CHUNKS SO
    // PROMPT_PREFIX PLUS THE CHUNK IS
    // WITHIN THE INPUT TOKEN LIMIT
    chunks = [fileToText.text];
    while (
      !areChunksValidForModelContext(
        chunks, // TODO - FIX SUBTLE BUG
        CONFIG.models[model].context,
        encoder
      )
    ) {
      let newChunks = makeChunksSmaller(
        // TODO - FIT MAX TEXT INTO CHUNK
        chunks,
        promptPrefix,
        CONFIG.models[model].context,
        encoder
      );
      chunks = newChunks;
    }

    // vvv DEBUG vvv
    console.log("DEBUGGING CHUNKS...");
    console.log("CHUNKS COUNT", chunks.length);

    for (let i = 0; i < chunks.length; i++) {
      console.log("CHUNK #", i);
      console.log("charCount of chunk", chunks[i].length);
      const promptTokenCount = encoder.encode(chunks[i]).length;
      console.log("promptTokenCount", promptTokenCount);
    }
    // ^^^ DEBUG ^^^

    // -v-v- WE NOW HAVE THE FILE IN CHUNKS THAT WILL NOT EXCEED THE MODEL CONTEXT LIMIT -v-v-
    // -v-v- SO WE LOOP OVER THE CHUNKS AND STORE THE SUMMARY OF EACH CHUNK -v-v-
    let summarizedChunksOfFile: {
      chunk: number;
      chunkSummary: string;
    }[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const prompt = `${promptPrefix} ${chunks[i]}`;
      const promptTokenCount = encoder.encode(prompt).length;
      inputTokens += promptTokenCount; // track input tokens
      tpmAccum += promptTokenCount; // accumulate input tokens
      // prettier-ignore
      p("total inputTokens", inputTokens, "total outputTokens", outputTokens, "tpmAccum", tpmAccum);
      if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) {
        p(`sleeping for ${tpmDelay / 60000} minute(s)`);
        await sleep(tpmDelay); // pause for model TPM LIMIT
        tpmAccum = 0; // reset the TPM LIMIT
      }
      // prettier-ignore
      p(`calling OpenAI to summarize chunk ${i} of file ${originalNameOfFile}...`);
      lastChunkBeforeFailing = i;
      await guard_beforeCallingModel(email, model); // GUARD AND CONFIRM THAT BALANCE WILL NOT GET OVERDRAWN
      await deductCostOfOpenAiInputTokens(
        promptTokenCount,
        model,
        config,
        account
      );
      const completion =
        await generateOpenAiUserChatCompletionWithExponentialBackoff(
          model,
          prompt,
          tpmDelay
        );
      const completionText: string =
        completion.data?.choices[0]?.message?.content || "ERROR: No Content";
      p(`snippet of last OpenAI completion - '${completionText.slice(0, 16)}'`);
      const outputTokenCount = encoder.encode(completionText).length;
      await deductCostOfOpenAiOutputTokens(
        outputTokenCount,
        model,
        config,
        account
      );
      outputTokens += outputTokenCount; // track output tokens
      tpmAccum += outputTokenCount; // accumulate total tokens
      summarizedChunksOfFile.push({ chunk: i, chunkSummary: completionText });
      p("i", i, "chunks.length", chunks.length);
      job.progress(job.progress() + (1 / chunks.length) * 100);
      p("job.progress()", job.progress()); // for console debugging
    }
    // -v-v- BUILD THE FINAL ANSWER THE CALLER WANTS -v-v-
    // prettier-ignore
    summaryForFile = ({ file: fileToText.originalName, summary: summarizedChunksOfFile });
    // -v-v- SAVE THE FINAL ANSWER TO DB -v-v-
    const { summaryV3Record } = await saveToDb(
      account,
      summaryForFile,
      model,
      language,
      format,
      batchId,
      file
    );
    // -v-v- SEND AN EMAIL NOTIFICATION -v-v-
    p("send email notification...");
    try {
      const emailConfig = summaryJobComplete_SES_Config(
        email,
        `${process.env.FRONTEND_HOSTNAME}/dashboard/summary-v3?summary-v3-id=${summaryV3Record.id}`,
        locale
      );
      await sesClient.send(new SendTemplatedEmailCommand(emailConfig));
      p("email sent");
    } catch (e) {}
    await checkout(
      inputTokens,
      outputTokens,
      CONFIG.models[model].pricing,
      account,
      email,
      summaryV3Record.id,
      locale
    );
    job.progress(100);
    const end = Date.now();
    // prettier-ignore
    console.log(`Execution time: ${end - start} ms or ${(end - start) / 1000 / 60} minutes`);
    done(null, { summaryV3Id: summaryV3Record.id });
  } catch (e) {
    p("ERROR", (e as Error).toString());

    if (process.env.NODE_ENV !== "production") {
      done(e as Error, {
        lastChunkBeforeFailing,
      });
    } else {
      done(e as Error, {
        lastChunkBeforeFailing,
      });
    }
  }
}
