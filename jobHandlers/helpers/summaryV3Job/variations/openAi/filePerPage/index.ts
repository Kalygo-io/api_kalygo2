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
import { breakOffMaxChunkForContext } from "./breakOffMaxChunkForContext";
import { getOverlapSegment } from "../../../shared/getOverlapSegment";
import { SupportedApiKeys } from "@prisma/client";
import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { secretsManagerClient } from "@/clients/aws_secrets_manager_client";
import { OpenAI, generateAccountOpenAI } from "@/clients/openai_client";

const tpmDelay = 60000;

export async function openAiSummarizeFilePerPage(
  customizations: SummaryV3OpenAiCustomizations,
  email: string,
  file: any,
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
    const accountOpenAiApiKey = account?.AwsSecretsManagerApiKey.find((i) => {
      return i.type === SupportedApiKeys.OPEN_AI_API_KEY;
    });
    // vvv fetch account OPEN_AI_API_KEY from AWS Secrets Manager vvv
    const command = new GetSecretValueCommand({
      SecretId: accountOpenAiApiKey?.secretId,
    });
    const secretsManagerResponse = await secretsManagerClient.send(command);
    // ^^^ ^^^
    const encoder = getEncoderForModel(model);
    let inputTokens = 0;
    let outputTokens = 0;
    const fileToText: {
      partsOfFile: any[];
      originalName: string;
    } = await convertFileToTextFormatWithMetadata(file);
    p("splitting text.*.*.");
    let tpmAccum: number = 0;
    const originalNameOfFile = fileToText.originalName;
    p("*** file to be processed ***", originalNameOfFile);
    let summariesForPartsOfFile: string[] = [];
    let pageCountOfFile = fileToText.partsOfFile.length;
    for (let page = 0; page < pageCountOfFile; page++) {
      let chunks: string[] = [
          `${
            page === 0
              ? ``
              : `${getOverlapSegment(
                  chunkTokenOverlap,
                  fileToText.partsOfFile[page - 1].text,
                  encoder
                )}`
          } ${fileToText.partsOfFile[page].text}`,
        ],
        chunksCounter: number = 0,
        summaryForPage: string = "";

      while (chunks.length > 0) {
        const promptPrefix = generatePromptPrefix(
          { format: "paragraph", length, language },
          summaryForPage
        );
        // CHECK THE PROMPT + THE CHUNK IS WITHIN THE MODEL'S INPUT TOKEN LIMIT
        while (
          // prettier-ignore
          !isChunkValidForModelContext(`${promptPrefix} ${chunks[0]}`, CONFIG.models[model].context, encoder)
        ) {
          console.log("breaking off MAX chunk for context...");
          // prettier-ignore
          chunks = breakOffMaxChunkForContext(promptPrefix, chunks, CONFIG.models[model].context, encoder);
        }
        const prompt = `${promptPrefix} ${chunks[0]}`;
        // prettier-ignore
        p("snippet of the next prompt up for completion...", prompt.slice(0, 16));
        const promptTokenCount = encoder.encode(prompt).length;
        inputTokens += promptTokenCount; // track input tokens
        tpmAccum += promptTokenCount; // accumulate total tokens
        // prettier-ignore
        p(`token length of prompt for next chunk ${chunksCounter} of file`, promptTokenCount);
        // prettier-ignore
        p("total inputTokens", inputTokens, "total outputTokens", outputTokens, "tpmAccum", tpmAccum);
        if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) {
          p(`sleeping for ${tpmDelay / 60000} minute(s)`);
          await sleep(tpmDelay); // pause for model TPM LIMIT
          tpmAccum = 0; // reset the TPM LIMIT
        }
        await guard_beforeCallingModel(email, model);
        let completion;
        if (!accountOpenAiApiKey) {
          // use static OpenAI client as account does NOT have an OPEN_AI_API_KEY
          // prettier-ignore
          await deductCostOfOpenAiInputTokens(promptTokenCount, model, config, account);
          p("call the A.I. model");
          completion =
            await generateOpenAiUserChatCompletionWithExponentialBackoff(
              model,
              prompt,
              tpmDelay,
              OpenAI
            );
        } else {
          completion =
            await generateOpenAiUserChatCompletionWithExponentialBackoff(
              model,
              prompt,
              tpmDelay,
              generateAccountOpenAI(secretsManagerResponse?.SecretString!)
            );
        }
        const completionText =
          completion.data?.choices[0]?.message?.content || "No Content";
        // prettier-ignore
        p(`snippet of last OpenAI completion - '${completionText.slice(0,16)}'`);
        const outputTokenCount = encoder.encode(completionText).length;
        if (!accountOpenAiApiKey) {
          await deductCostOfOpenAiOutputTokens(
            outputTokenCount,
            model,
            config,
            account
          );
        }
        outputTokens += outputTokenCount; // track output tokens
        summariesForPartsOfFile.push(completionText);
        job.progress((page / pageCountOfFile) * 90);
        p("progress:", job.progress());
        console.log("moving onto the next chunk...");
        chunks.shift();
        chunksCounter++;
      }
    }
    p("saving to db...");
    const { summaryV3Record } = await saveToDb(
      account,
      {
        file: originalNameOfFile,
        summariesOfTheParts: summariesForPartsOfFile,
      },
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
