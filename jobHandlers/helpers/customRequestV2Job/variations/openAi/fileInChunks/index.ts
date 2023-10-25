import prisma from "@/db/prisma_client";
import { sleep } from "@/utils/sleep";
import CONFIG from "@/config";
import { areChunksWithPromptPrefixValidForModelContext } from "@/utils/areChunksWithPromptPrefixValidForModelContext";
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
import { makeChunksFitContext } from "./makeChunksFitContext";
import { deductCostOfOpenAiInputTokens } from "../../../shared/deductCostOfOpenAiInputTokens";
import { deductCostOfOpenAiOutputTokens } from "../../../shared/deductCostOfOpenAiOutputTokens";

const tpmDelay = 60000;

export async function openAiFileInChunks(
  customizations: CustomRequestV2OpenAiCustomizations,
  email: string,
  file: any,
  job: any,
  batchId: string,
  locale: string,
  done: (err?: Error | null | undefined, result?: any) => void
) {
  let lastChunkBeforeFailing = 0;
  let chunks: string[] = [];

  try {
    p("CustomRequestV2 - SCANNING MODE - File In Chunks");
    const start = Date.now();
    const {
      prompts: { prompt },
      model,
      chunkTokenOverlap,
    } = customizations;
    job.progress(0);

    const { account } = await guard_beforeRunningCustomRequest(email, model);
    const encoder = getEncoderForModel(model);
    let inputTokens = 0;
    let outputTokens = 0;
    const fileToText: {
      text: string;
      originalName: string;
    } = await convertFileToTextFormat(file);
    const promptPrefix = prompt;
    // prettier-ignore
    let completionsForFile: { file: string, completions: { chunk: number; completion: string }[] };
    let tpmAccum: number = 0;
    const originalNameOfFile = fileToText.originalName;
    p("*** file to be processed ***", originalNameOfFile);
    chunks = [fileToText.text];
    while (
      !areChunksWithPromptPrefixValidForModelContext(
        promptPrefix,
        chunks,
        CONFIG.models[model].context,
        encoder
      )
    ) {
      p("in while loop...");
      let newChunks = makeChunksFitContext(
        chunks,
        promptPrefix,
        CONFIG.models[model].context,
        encoder,
        chunkTokenOverlap
      );
      chunks = newChunks;
    }
    let completedChunksOfFile: {
      chunk: number;
      completion: string;
    }[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const prompt = `PROMPT: ${promptPrefix}
DATA: ${chunks[i]}`;
      const promptTokenCount = encoder.encode(prompt).length;
      deductCostOfOpenAiInputTokens(promptTokenCount, model, config, account);
      inputTokens += promptTokenCount; // track input tokens
      tpmAccum += promptTokenCount; // accumulate input tokens
      p(`token length of prompt for chunk ${i}`, promptTokenCount);
      p("inputTokens", inputTokens);
      p("outputTokens", outputTokens);
      p("tpmAccum", tpmAccum);

      if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) {
        await sleep(tpmDelay);
        tpmAccum = 0;
      }
      // prettier-ignore
      p(`calling OpenAI to summarize chunk ${i} of file ${originalNameOfFile}...`);
      lastChunkBeforeFailing = i;
      await guard_beforeCallingModel(email, model);
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
      deductCostOfOpenAiOutputTokens(outputTokenCount, model, config, account);
      outputTokens += outputTokenCount; // track output tokens
      tpmAccum += outputTokenCount; // accumulate output tokens

      completedChunksOfFile.push({
        chunk: i,
        completion: completionText,
      });
      p("job.progress()", job.progress()); // for console debugging
      p("i", i, "chunks.length", chunks.length); // for console debugging
      // prettier-ignore
      p(`this collection of chunks represents ${Math.floor(100)}% of the total progress`); // for console debugging
      // prettier-ignore
      job.progress(job.progress() + ((1 / chunks.length) * 100));
      p("after job.progress() update", job.progress());
    }
    completionsForFile = {
      file: fileToText.originalName,
      completions: completedChunksOfFile,
    };
    const { customRequestV2Record } = await saveToDb(
      account,
      completionsForFile,
      model,
      locale,
      batchId,
      file
    );
    await checkout(
      inputTokens,
      outputTokens,
      CONFIG.models[model].pricing,
      account,
      email,
      customRequestV2Record.id,
      locale
    );
    job.progress(100);
    const end = Date.now();
    // prettier-ignore
    console.log(`Execution time: ${end - start} ms or ${(end - start) / 1000 / 60} minutes`);
    done(null, { customRequestV2Id: customRequestV2Record.id });
  } catch (e) {
    done(e as Error, {
      lastChunkBeforeFailing,
    });
  }
}
