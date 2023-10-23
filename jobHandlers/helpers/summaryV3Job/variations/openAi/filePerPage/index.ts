import { sleep } from "@/utils/sleep";
import CONFIG from "@/config";
import { SummaryV3OpenAiCustomizations } from "@/types/SummaryV3OpenAiCustomizations";
import { p } from "@/utils/p";
import { guard_beforeRunningSummary } from "../../../shared/guards/guard_beforeRunningSummary";
import { checkout } from "../../../shared/checkout";
import { generateOpenAiUserChatCompletionWithExponentialBackoff } from "../../../shared/generateOpenAiUserChatCompletionWithExponentialBackoff";
import config from "@/config";
import { guard_beforeCallingModel } from "../../../shared/guards/guard_beforeCallingModel";
import { generatePromptPrefix } from "./generatePromptPrefix";
import { isChunkValidForModelContext } from "@/utils/isChunkValidForModelContext";
import { convertFileToTextFormatWithMetadata } from "@/utils/convertFileToTextFormatWithMetadata";
import { getEncoderForModel } from "../../../shared/getEncoderForModel";
import { deductCostOfOpenAiInputTokens } from "../../../shared/deductCostOfOpenAiInputTokens";
import { deductCostOfOpenAiOutputTokens } from "../../../shared/deductCostOfOpenAiOutputTokens";
import { saveToDb } from "./saveToDb";

const tpmDelay = 60000;

export async function openAiSummarizeFilePerPage(
  customizations: SummaryV3OpenAiCustomizations,
  email: string,
  file: any,
  bucket: string,
  job: any,
  batchId: string,
  locale: string,
  done: (err?: Error | null | undefined, result?: any) => void
) {
  try {
    p("Summarize Each File Overall");
    const start = Date.now();
    const { format, length, language, model, chunkTokenOverlap } =
      customizations;
    job.progress(0);
    const { account } = await guard_beforeRunningSummary(email, model);
    const encoder = getEncoderForModel(model);
    let inputTokens = 0;
    let outputTokens = 0;
    const fileToText: {
      partsOfFile: any[];
      originalName: string;
    } = await convertFileToTextFormatWithMetadata(file, bucket);
    p("splitting text.*.*.");
    let summaryOfEachPartOfEachFile: {
      file: string;
      summariesOfTheParts: string[];
    };
    let tpmAccum: number = 0;
    const originalNameOfFile = fileToText.originalName;
    p("*** file to be processed ***", originalNameOfFile);
    let summariesForPartsOfCurrentFile = [];
    let partsOfCurrentFile = fileToText.partsOfFile.length;
    for (let part = 0; part < partsOfCurrentFile; part++) {
      const textInPartOfFile = fileToText.partsOfFile[part].text;
      console.log("___ --- ___");
      let promptPrefix = generatePromptPrefix({
        format,
        length,
        language,
      });
      if (
        isChunkValidForModelContext(
          `${promptPrefix} ${textInPartOfFile}`,
          CONFIG.models[model].context,
          encoder
        )
      ) {
        const prompt = `${promptPrefix} ${textInPartOfFile}`;
        const promptTokenCount = encoder.encode(prompt).length;
        inputTokens += promptTokenCount; // track input tokens
        tpmAccum += promptTokenCount; // accumulate input tokens

        // prettier-ignore
        p(`token length of prompt for next part ${part} of file`, promptTokenCount);
        p("inputTokens", inputTokens);
        p("outputTokens", outputTokens);
        p("tpmAccum", tpmAccum);
        // -v-v- WE NOW HAVE EXCEEDED THE TOKENS / MINUTE LIMIT SO WE PAUSE -v-v-
        // prettier-ignore
        if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) {
          // tpmBuffer is to control how close to the rate limit you want to get
          p(`sleeping for ${tpmDelay / 60000} minute(s)`); // for console debugging...
          await sleep(tpmDelay);
          tpmAccum = 0;
        }
        await guard_beforeCallingModel(email, model);
        // prettier-ignore
        await deductCostOfOpenAiInputTokens(promptTokenCount, model, config, account);
        p("call the A.I. model");
        let completion =
          await generateOpenAiUserChatCompletionWithExponentialBackoff(
            model,
            prompt,
            tpmDelay
          );
        const completionText =
          completion.data?.choices[0]?.message?.content || "No Content";
        // prettier-ignore
        p(`snippet of last OpenAI completion - '${completionText.slice(0,16)}'`);
        const outputTokenCount = encoder.encode(completionText).length;
        await deductCostOfOpenAiOutputTokens(
          outputTokenCount,
          model,
          config,
          account
        );
        outputTokens += outputTokenCount; // track output tokens
        // -v-v- STORING THE COMPLETION OF THIS PART OF THE FILE -v-v-
        summariesForPartsOfCurrentFile.push(completionText);
        job.progress((part / partsOfCurrentFile) * 90);
        p("progress:", job.progress());
      } else {
        throw new Error(
          "Prompt prefix plus text for part of file exceeds context of A.I. model"
        );
      }
    }
    summaryOfEachPartOfEachFile = {
      file: originalNameOfFile,
      summariesOfTheParts: summariesForPartsOfCurrentFile,
    };
    p("saving to db...");
    const { summaryV3Record } = await saveToDb(
      account,
      summaryOfEachPartOfEachFile,
      model,
      language,
      format,
      batchId,
      file
    );
    job.progress(95);
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
    done(e as Error, null);
  }
}
