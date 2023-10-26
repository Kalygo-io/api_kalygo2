import prisma from "@/db/prisma_client";
import { summaryJobComplete_SES_Config } from "@/emails/v2/summaryJobComplete";
import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "@/clients/ses_client";
import { ScanningMode } from "@prisma/client";
import { sleep } from "@/utils/sleep";
import CONFIG from "@/config";
import { p } from "@/utils/p";
import { guard_beforeRunningCustomRequest } from "../../../shared/guards/guard_beforeRunningCustomRequest";
import { checkout } from "../../../shared/checkout";
import { generateOpenAiUserChatCompletionWithExponentialBackoff } from "../../../shared/generateOpenAiUserChatCompletionWithExponentialBackoff";
import config from "@/config";
import { guard_beforeCallingModel } from "../../../shared/guards/guard_beforeCallingModel";
import { isChunkValidForModelContext } from "@/utils/isChunkValidForModelContext";
import { CustomRequestV3OpenAiCustomizations } from "@/types/CustomRequestV3OpenAiCustomizations";
import { getEncoderForModel } from "../../../shared/getEncoderForModel";
import { convertFileToTextFormatWithMetadata } from "@/utils/convertFileToTextFormatWithMetadata";
import { deductCostOfOpenAiInputTokens } from "../../../shared/deductCostOfOpenAiInputTokens";
import { deductCostOfOpenAiOutputTokens } from "../../../shared/deductCostOfOpenAiOutputTokens";
import { saveToDb } from "./saveToDb";

const tpmDelay = 60000;

export async function openAiFilePerPage(
  customizations: CustomRequestV3OpenAiCustomizations,
  email: string,
  file: Express.Multer.File & { bucket: string; key: string; etag: string },
  job: any,
  batchId: string,
  locale: string,
  done: (err?: Error | null | undefined, result?: any) => void
) {
  try {
    p("CustomRequestV3 - Scan Mode - filePerPage");
    const start = Date.now();
    const {
      model,
      prompts: { prompt },
    } = customizations;
    job.progress(0);
    const { account } = await guard_beforeRunningCustomRequest(email, model);
    const encoder = getEncoderForModel(model);
    let inputTokens = 0;
    let outputTokens = 0;
    const fileToText: {
      partsOfFile: any[];
      originalName: string;
    } = await convertFileToTextFormatWithMetadata(file);
    p("splitting text.*.*.");
    let resultForEachPageOfFile: {
      file: string;
      completionsForTheParts: string[];
    };
    let tpmAccum: number = 0;

    const originalNameOfFile = fileToText.originalName;
    // prettier-ignore
    p("*** file to be processed ***", originalNameOfFile);

    let completionsForPartsOfCurrentFile = [];
    let partsOfCurrentFile = fileToText.partsOfFile.length;
    for (let part = 0; part < partsOfCurrentFile; part++) {
      const textInPartOfFile = fileToText.partsOfFile[part].text;
      console.log("___ --- ___");

      let promptPrefix = prompt;

      // TODO - handle situation where page has "TOO MUCH" text on it : )
      if (
        isChunkValidForModelContext(
          `${promptPrefix} ${textInPartOfFile}`,
          CONFIG.models[model].context,
          encoder
        )
      ) {
        const nextPrompt = `${promptPrefix} ${textInPartOfFile}`;
        const nextPromptTokenCount = encoder.encode(nextPrompt).length;
        inputTokens += nextPromptTokenCount; // track input tokens
        tpmAccum += nextPromptTokenCount; // accumulate input tokens

        // prettier-ignore
        p(`token length of prompt for next part ${part} of file`, nextPromptTokenCount);
        p("inputTokens", inputTokens);
        p("outputTokens", outputTokens);
        p("tpmAccum", tpmAccum);
        if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) {
          p(`sleeping for ${tpmDelay / 60000} minute(s)`);
          await sleep(tpmDelay);
          tpmAccum = 0;
        }

        await guard_beforeCallingModel(email, model);
        await deductCostOfOpenAiInputTokens(
          nextPromptTokenCount,
          model,
          config,
          account
        );
        let completion =
          await generateOpenAiUserChatCompletionWithExponentialBackoff(
            model,
            nextPrompt,
            tpmDelay
          );
        const completionText =
          completion.data?.choices[0]?.message?.content || "No Content";
        // prettier-ignore
        p(`snippet of last OpenAI completion - '${completionText.slice(0,16)}'`);
        const outputTokenCount = encoder.encode(completionText).length;
        deductCostOfOpenAiOutputTokens(
          outputTokenCount,
          model,
          config,
          account
        );
        outputTokens += outputTokenCount; // track output tokens
        tpmAccum += outputTokenCount; // accumulate output tokens
        completionsForPartsOfCurrentFile.push(completionText);

        console.log("part", part, "partsOfCurrentFile", partsOfCurrentFile);

        job.progress((part / partsOfCurrentFile) * 90);
        p("progress:", job.progress());
      } else {
        throw new Error(
          "Prompt prefix plus text for part of file exceeds context of A.I. model"
        );
      }
    }

    resultForEachPageOfFile = {
      file: originalNameOfFile,
      completionsForTheParts: completionsForPartsOfCurrentFile,
    };

    const { customRequestV3Record } = await saveToDb(
      account,
      resultForEachPageOfFile,
      model,
      prompt,
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
