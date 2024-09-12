import { sleep } from "@/utils/sleep";
import CONFIG from "@/config";
import { p } from "@/utils/p";
import { isChunkValidForModelContext } from "@/utils/isChunkValidForModelContext";
import { guard_beforeRunningCustomRequest } from "../../../shared/guards/guard_beforeRunningCustomRequest";
import { checkout } from "../../../shared/checkout";
import { generateOpenAiUserChatCompletionWithExponentialBackoff } from "../../../shared/generateOpenAiUserChatCompletionWithExponentialBackoff";
import config from "@/config";
import { guard_beforeCallingModel } from "../../../shared/guards/guard_beforeCallingModel";
import { CustomRequestV3AnthropicCustomizations } from "@/types/CustomRequestV3AnthropicCustomizations";
import { getEncoderForModel } from "../../../shared/getEncoderForModel";
import { convertFileToTextFormat } from "@/utils/convertFileToTextFormat";
import { deductCostOfAnthropicInputTokens } from "../../../shared/deductCostOfAnthropicInputTokens";
import { deductCostOfAnthropicOutputTokens } from "../../../shared/deductCostOfAnthropicOutputTokens";
import { saveToDb } from "./saveToDb";
import { makeChunksFitContext } from "./makeChunksFitContext";
import { breakOffMaxChunkForContext } from "./breakOffMaxChunkForContext";
import { getOverlapSegment } from "../../../shared/getOverlapSegment";
import { guard_beforeRunningCustomRequestWithAnthropic } from "../../../shared/guards/guard_beforeRunningCustomRequestWithAnthropic";
import { getEncoderForAnthropicModel } from "../../../shared/getEncoderForAnthropicModel";
import { guard_beforeCallingAnthropicModel } from "../../../shared/guards/guard_beforeCallingAnthropicModel";
import { generateAnthropicUserChatCompletionWithExponentialBackoff } from "../../../shared/generateAnthropicUserChatCompletionWithExponentialBackoff";

const tpmDelay = 60000;

export async function anthropicFileOverall(
  customizations: CustomRequestV3AnthropicCustomizations,
  email: string,
  file: Express.Multer.File & { bucket: string; key: string; etag: string },
  job: any,
  batchId: string,
  locale: string,
  done: (err?: Error | null | undefined, result?: any) => void
) {
  try {
    p("CustomRequestV3 - File Overall");
    const start = Date.now();
    const {
      prompts: { prompt, finalPrompt },
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
    p("splitting text.*.*.");
    // prettier-ignore
    let completionForFile: { file: string; finalCompletionForFile: string; };
    let tpmAccum: number = 0;
    const originalNameOfFile = fileToText.originalName;
    p("*** file to be processed ***", originalNameOfFile);
    let chunks = [fileToText.text];
    let contextForFile = "";
    let finalCompletionForFile = "";
    let tokenAccumWithoutPrefixForFile: number = 0;
    const totalTokenCountInFile: number = encoder.encode(chunks[0]).length;
    while (chunks.length > 0) {
      p("processing next chunk of the file...");
      let promptPrefix = contextForFile
        ? `${contextForFile && `PREVIOUS CONTEXT: ${contextForFile}`}
        
PROMPT: ${prompt}

DATA:`
        : `PROMPT: ${prompt}

DATA:`;
      while (
        !isChunkValidForModelContext(
          `${promptPrefix} ${chunks[0]}`,
          CONFIG.models.anthropic[model].context,
          encoder
        )
      ) {
        chunks = breakOffMaxChunkForContext(
          promptPrefix,
          chunks,
          CONFIG.models.anthropic[model].context,
          encoder
        );
      }
      tokenAccumWithoutPrefixForFile = encoder.encode(chunks[0]).length;
      const nextPrompt = `${promptPrefix}
${chunks[0]}`;
      // prettier-ignore
      p("snippet of the next prompt up for completion...", nextPrompt.slice(0, 16));
      const nextPromptTokenCount = encoder.encode(nextPrompt).length;
      inputTokens += nextPromptTokenCount;
      tpmAccum += nextPromptTokenCount;
      p("inputTokens", inputTokens);
      p("outputTokens", outputTokens);
      p("tpmAccum", tpmAccum);
      if (tpmAccum > CONFIG.models.anthropic[model].tpm - CONFIG.tpmBuffer) {
        p(`sleeping for ${tpmDelay / 60000} minute(s)`);
        await sleep(tpmDelay);
        tpmAccum = 0;
      }
      await guard_beforeCallingAnthropicModel(email, model);
      // prettier-ignore
      await deductCostOfAnthropicInputTokens(nextPromptTokenCount, model, config, account);
      let completion =
        await generateAnthropicUserChatCompletionWithExponentialBackoff(
          model,
          nextPrompt,
          tpmDelay
        );
      // const completionText = completion.completion || "No Content";
      const completionText: string =
        // @ts-ignore
        completion.content.reduce((acc, curr, idx) => curr.text, "") ||
        "No Content";
      p(`snippet of last OpenAI completion - '${completionText.slice(0, 16)}'`);
      const outputTokenCount = encoder.encode(completionText).length;
      // prettier-ignore
      await deductCostOfAnthropicOutputTokens(outputTokenCount, model, config, account);
      outputTokens += outputTokenCount;
      tpmAccum += outputTokenCount;
      contextForFile = completionText;
      p("tokenAccumWithoutPrefixForFile", tokenAccumWithoutPrefixForFile);
      p("totalTokenCountInFile", totalTokenCountInFile);
      // prettier-ignore
      if (chunks.length > 1) {
        console.log("chunks.length > 1 so getting overlap segment...");
        const overlapSegment: string = getOverlapSegment(
          chunkTokenOverlap,
          chunks[0],
          encoder
        );
        // prettier-ignore
        job.progress(job.progress() + (tokenAccumWithoutPrefixForFile - chunkTokenOverlap)  / totalTokenCountInFile * 90); // HACK BUT WORKS : )
        p("progress:", job.progress());
        chunks[1] = overlapSegment + chunks[1];
      } else {
        console.log("chunks.length == 1...");
        // prettier-ignore
        job.progress(job.progress() + tokenAccumWithoutPrefixForFile / totalTokenCountInFile * 90);
        p("progress:", job.progress());
      }
      chunks.shift();
    }
    if (finalPrompt) {
      let finalPromptPrefix = finalPrompt;
      const finalPromptForCompletion = `PROMPT: ${finalPromptPrefix}
        
DATA: ${contextForFile}`;
      // prettier-ignore
      const finalPromptTokenCount = encoder.encode(finalPromptForCompletion).length; // TODO - handle scenario where finalPromptForCompletion exceeds model context
      await deductCostOfAnthropicInputTokens(
        finalPromptTokenCount,
        model,
        config,
        account
      );
      inputTokens += finalPromptTokenCount;
      tpmAccum += finalPromptTokenCount;
      if (tpmAccum > CONFIG.models.anthropic[model].tpm - CONFIG.tpmBuffer) {
        await sleep(tpmDelay);
        tpmAccum = 0;
      }
      await guard_beforeCallingAnthropicModel(email, model);
      let completion =
        await generateAnthropicUserChatCompletionWithExponentialBackoff(
          model,
          finalPromptForCompletion,
          tpmDelay
        );
      // const finalCompletionText = completion.content || "ERROR: No Content";
      const finalCompletionText: string =
        // @ts-ignore
        completion.content.reduce((acc, curr, idx) => curr.text, "") ||
        "ERROR: No Content";
      const finalCompletionTextTokenCount =
        encoder.encode(finalCompletionText).length;
      outputTokens += finalCompletionTextTokenCount;
      tpmAccum += finalCompletionTextTokenCount;
      await deductCostOfAnthropicOutputTokens(
        finalCompletionTextTokenCount,
        model,
        config,
        account
      );
      // prettier-ignore
      p("snippet of completion of final generation request", finalCompletionText.slice(0, 16));
      finalCompletionForFile = finalCompletionText;
    } else {
      finalCompletionForFile = contextForFile;
    }
    // prettier-ignore
    completionForFile = { file: fileToText.originalName, finalCompletionForFile: finalCompletionForFile };
    const { customRequestV3Record } = await saveToDb(
      account,
      completionForFile,
      model,
      prompt,
      finalPrompt,
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
    done(e as Error, null);
  }
}
