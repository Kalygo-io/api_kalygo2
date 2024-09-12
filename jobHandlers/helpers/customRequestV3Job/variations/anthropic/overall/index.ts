import prisma from "@/db/prisma_client";
import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "@/clients/ses_client";
import { sleep } from "@/utils/sleep";
import CONFIG from "@/config";
import { p } from "@/utils/p";
import { convertFilesToTextFormat } from "@/utils/convertFilesToTextFormat";

import { isChunkValidForModelContext } from "@/utils/isChunkValidForModelContext";
import { checkout } from "../../../shared/checkout";
import { breakUpNextChunkForOverallPrompt } from "./breakUpNextChunkForOverallPrompt";
import config from "@/config";
import { customRequestJobComplete_SES_Config } from "@/emails/v2/customRequestJobComplete";
import { CustomRequestV3AnthropicCustomizations } from "@/types/CustomRequestV3AnthropicCustomizations";

import { breakOffMaxChunkForContext } from "./breakOffMaxChunkForContext";
import { getOverlapSegment } from "../../../shared/getOverlapSegment";
import { saveToDb } from "./saveToDb";
import { guard_beforeRunningCustomRequestWithAnthropic } from "../../../shared/guards/guard_beforeRunningCustomRequestWithAnthropic";
import { getEncoderForAnthropicModel } from "../../../shared/getEncoderForAnthropicModel";
import { deductCostOfAnthropicInputTokens } from "../../../shared/deductCostOfAnthropicInputTokens";
import { generateAnthropicUserChatCompletionWithExponentialBackoff } from "../../../shared/generateAnthropicUserChatCompletionWithExponentialBackoff";
import { guard_beforeCallingAnthropicModel } from "../../../shared/guards/guard_beforeCallingAnthropicModel";
import { deductCostOfAnthropicOutputTokens } from "../../../shared/deductCostOfAnthropicOutputTokens";

const tpmDelay = 60000;

export async function anthropicOverall(
  customizations: CustomRequestV3AnthropicCustomizations,
  email: string,
  files: (Express.Multer.File & {
    bucket: string;
    key: string;
    etag: string;
  })[],
  job: any,
  batchId: string,
  locale: string,
  done: (err?: Error | null | undefined, result?: any) => void
) {
  try {
    p("CustomRequestV3 - All Files Overall");
    const start = Date.now();
    const {
      prompts: { prompt, overallPrompt },
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
    const filesToText: {
      text: string;
      originalName: string;
    }[] = await convertFilesToTextFormat(files);
    p("splitting text.*.*.");
    let completionForEachFile: {
      fileName: string;
      finalCompletionForFile: string;
    }[] = [];
    let tpmAccum = 0;
    for (let fIndex = 0; fIndex < filesToText.length; fIndex++) {
      const originalNameOfFile = filesToText[fIndex].originalName;
      p("*** file to be processed ***", originalNameOfFile);
      let chunks = [filesToText[fIndex].text];
      let chunksCounter = 0;
      let contextForFile = "";
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
        p("WE HAVE NOW BIT OFF AN ACCEPTABLE CHUNK"); // for console debugging...
        const nextPrompt = `${promptPrefix} ${chunks[0]}`;
        // prettier-ignore
        p("snippet of nextPrompt up for completion...", nextPrompt.slice(0, 16));
        const nextPromptTokenCount = encoder.encode(nextPrompt).length;
        chunksCounter += 1;
        inputTokens += nextPromptTokenCount; // track input tokens
        tpmAccum += nextPromptTokenCount; // accumulate input tokens
        // prettier-ignore
        p(`token length of prompt for next chunk ${chunksCounter} of file`, nextPromptTokenCount);
        p("tpmAccum", tpmAccum);
        // prettier-ignore
        if (tpmAccum > CONFIG.models.anthropic[model].tpm - CONFIG.tpmBuffer) {
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
        // prettier-ignore
        p(`snippet of last OpenAI completion - '${completionText.slice(0,16)}'`);
        const outputTokenCount = encoder.encode(completionText).length;
        await deductCostOfAnthropicOutputTokens(
          outputTokenCount,
          model,
          config,
          account
        );
        outputTokens += outputTokenCount; // track output tokens
        tpmAccum += outputTokenCount; // accumulate output tokens
        contextForFile = completionText;
        // prettier-ignore
        p("tokenAccumWithoutPrefixForFile", tokenAccumWithoutPrefixForFile);
        // prettier-ignore
        p("totalTokenCountInFile", totalTokenCountInFile);
        if (chunks.length > 1) {
          console.log("chunks.length > 1 so getting overlap segment...");
          const overlapSegment: string = getOverlapSegment(
            chunkTokenOverlap,
            chunks[0],
            encoder
          );
          // prettier-ignore
          job.progress(job.progress() + (tokenAccumWithoutPrefixForFile - chunkTokenOverlap)  / totalTokenCountInFile * (90 / files.length));
          p("progress:", job.progress());
          chunks[1] = overlapSegment + chunks[1];
        } else {
          // prettier-ignore
          job.progress(job.progress() + tokenAccumWithoutPrefixForFile / totalTokenCountInFile * (90 / files.length));
          p("progress:", job.progress());
        }
        chunks.shift();
      }
      completionForEachFile.push({
        fileName: filesToText[fIndex].originalName,
        finalCompletionForFile: contextForFile,
      });
    }
    const completionsOfEachFileConcatenated: string = completionForEachFile
      .map((i) => {
        return `Here is the contextual information related to the file ${i.fileName}: ${i.finalCompletionForFile}`;
      })
      .join("\n\n");
    let chunks = [completionsOfEachFileConcatenated];
    let finalOverallPromptOutputs: {
      part: number;
      overallCompletion: string;
    }[] = [];
    let overallCompletionPartCounter = 0;
    while (chunks.length > 0) {
      p("outer while...");
      let finalPrompt = `PROMPT: ${overallPrompt}

CONTEXT OF EACH FILE: ${chunks[0]}`;

      while (
        !isChunkValidForModelContext(
          finalPrompt,
          CONFIG.models.anthropic[model].context,
          encoder
        )
      ) {
        breakUpNextChunkForOverallPrompt(chunks, completionForEachFile); // TODO: handle case when OVERALL prompt outputs exceeds context
      }

      p("WE HAVE NOW BIT OFF AN ACCEPTABLE CHUNK");

      finalPrompt = `PROMPT: ${overallPrompt}

CONTEXT OF EACH FILE: ${chunks[0]}`;

      p("*** snippet of finalPrompt... ***", finalPrompt.slice(0, 16));
      const finalPromptTokenCount = encoder.encode(finalPrompt).length;
      p("tokens to be sent", finalPromptTokenCount);
      inputTokens += encoder.encode(finalPrompt).length;
      tpmAccum += encoder.encode(finalPrompt).length;
      if (tpmAccum > CONFIG.models.anthropic[model].tpm - CONFIG.tpmBuffer) {
        await sleep(tpmDelay);
        tpmAccum = 0;
      }

      await guard_beforeCallingAnthropicModel(email, model);
      await deductCostOfAnthropicInputTokens(
        finalPromptTokenCount,
        model,
        config,
        account
      );
      let completion =
        await generateAnthropicUserChatCompletionWithExponentialBackoff(
          model,
          finalPrompt,
          tpmDelay
        );
      // const completionText = completion.completion || "No Content";
      const completionText: string =
        // @ts-ignore
        completion.content.reduce((acc, curr, idx) => curr.text, "") ||
        "No Content";
      const outputTokenCount = encoder.encode(completionText).length;

      await deductCostOfAnthropicOutputTokens(
        outputTokenCount,
        model,
        config,
        account
      );

      outputTokens += outputTokenCount; // track output tokens
      tpmAccum += outputTokenCount; // accumulate output tokens
      // prettier-ignore
      p("snippet of completion of FINAL request...", completionText.slice(0, 16));
      // prettier-ignore
      finalOverallPromptOutputs.push({ part: overallCompletionPartCounter, overallCompletion: completionText });
      chunks.shift();
      overallCompletionPartCounter++;
    }

    const { customRequestV3Record } = await saveToDb(
      account,
      finalOverallPromptOutputs,
      model,
      prompt,
      overallPrompt,
      batchId,
      files
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
