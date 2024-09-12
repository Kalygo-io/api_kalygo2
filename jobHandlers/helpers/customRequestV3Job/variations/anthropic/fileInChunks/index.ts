import { sleep } from "@/utils/sleep";
import CONFIG from "@/config";
import { p } from "@/utils/p";
import { checkout } from "../../../shared/checkout";
import config from "@/config";
import { CustomRequestV3AnthropicCustomizations } from "@/types/CustomRequestV3AnthropicCustomizations";
import { convertFileToTextFormat } from "@/utils/convertFileToTextFormat";
import { saveToDb } from "./saveToDb";
import { makeChunksFitContext } from "./makeChunksFitContext";
import { areChunksWithPromptPrefixValidForAnthropicModelContext } from "@/utils/areChunksWithPromptPrefixValidForAnthropicModelContext";
import { getEncoderForAnthropicModel } from "../../../shared/getEncoderForAnthropicModel";
import { deductCostOfAnthropicInputTokens } from "../../../shared/deductCostOfAnthropicInputTokens";
import { guard_beforeRunningCustomRequestWithAnthropic } from "../../../shared/guards/guard_beforeRunningCustomRequestWithAnthropic";
import { guard_beforeCallingAnthropicModel } from "../../../shared/guards/guard_beforeCallingAnthropicModel";
import { generateAnthropicUserChatCompletionWithExponentialBackoff } from "../../../shared/generateAnthropicUserChatCompletionWithExponentialBackoff";
import { deductCostOfAnthropicOutputTokens } from "../../../shared/deductCostOfAnthropicOutputTokens";

const tpmDelay = 60000;

export async function anthropicFileInChunks(
  customizations: CustomRequestV3AnthropicCustomizations,
  email: string,
  file: Express.Multer.File & { bucket: string; key: string; etag: string },
  job: any,
  batchId: string,
  locale: string,
  done: (err?: Error | null | undefined, result?: any) => void
) {
  let lastChunkBeforeFailing = 0;
  let chunks: string[] = [];

  try {
    p("CustomRequestV3 - File In Chunks");
    const start = Date.now();
    const {
      prompts: { prompt },
      model,
      chunkTokenOverlap,
    } = customizations;
    job.progress(0);
    const { account } = await guard_beforeRunningCustomRequestWithAnthropic(
      email,
      model
    );
    const encoder = getEncoderForAnthropicModel(model);
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
      !areChunksWithPromptPrefixValidForAnthropicModelContext(
        promptPrefix,
        chunks,
        CONFIG.models.anthropic[model].context,
        encoder
      )
    ) {
      p("in while loop...");
      let newChunks = makeChunksFitContext(
        chunks,
        promptPrefix,
        CONFIG.models.anthropic[model].context,
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
      deductCostOfAnthropicInputTokens(
        promptTokenCount,
        model,
        config,
        account
      );
      inputTokens += promptTokenCount; // track input tokens
      tpmAccum += promptTokenCount; // accumulate input tokens
      p(`token length of prompt for chunk ${i}`, promptTokenCount);
      p("inputTokens", inputTokens);
      p("outputTokens", outputTokens);
      p("tpmAccum", tpmAccum);

      if (tpmAccum > CONFIG.models.anthropic[model].tpm - CONFIG.tpmBuffer) {
        await sleep(tpmDelay);
        tpmAccum = 0;
      }
      // prettier-ignore
      p(`calling OpenAI to summarize chunk ${i} of file ${originalNameOfFile}...`);
      lastChunkBeforeFailing = i;
      await guard_beforeCallingAnthropicModel(email, model);
      const completion =
        await generateAnthropicUserChatCompletionWithExponentialBackoff(
          model,
          prompt,
          tpmDelay
        );

      const completionText: string =
        // @ts-ignore
        completion.content.reduce((acc, curr, idx) => curr.text, "") ||
        "ERROR: No Content";
      p(`snippet of last OpenAI completion - '${completionText.slice(0, 16)}'`);
      const outputTokenCount = encoder.encode(completionText).length;
      deductCostOfAnthropicOutputTokens(
        outputTokenCount,
        model,
        config,
        account
      );
      outputTokens += outputTokenCount; // track output tokens
      tpmAccum += outputTokenCount; // accumulate output tokens

      completedChunksOfFile.push({
        chunk: i,
        completion: completionText,
      });
      p("job.progress()", job.progress());
      p("i", i, "chunks.length", chunks.length);
      // prettier-ignore
      p(`this collection of chunks represents ${Math.floor(100)}% of the total progress`);
      // prettier-ignore
      job.progress(job.progress() + ((1 / chunks.length) * 100));
      p("after job.progress() update", job.progress());
    }
    completionsForFile = {
      file: fileToText.originalName,
      completions: completedChunksOfFile,
    };
    const { customRequestV3Record } = await saveToDb(
      account,
      completionsForFile,
      model,
      prompt,
      batchId,
      file
    );
    await checkout(
      inputTokens,
      outputTokens,
      CONFIG.models.anthropic[model].pricing,
      account,
      email,
      customRequestV3Record.id,
      locale
    );
    job.progress(100);
    const end = Date.now();
    // prettier-ignore
    console.log(`Execution time: ${end - start} ms or ${(end - start) / 1000 / 60} minutes`);
    done(null, { customRequestV3Id: customRequestV3Record.id });
  } catch (e) {
    done(e as Error, {
      lastChunkBeforeFailing,
    });
  }
}
