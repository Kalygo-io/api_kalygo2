import { generatePromptPrefix } from "./generatePromptPrefix";
import { sleep } from "@/utils/sleep";
import CONFIG from "@/config";
import { p } from "@/utils/p";
import { guard_beforeRunningSummary } from "../../../shared/guards/guard_beforeRunningSummary";
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
import { areChunksWithPromptPrefixValidForModelContext } from "@/utils/areChunksWithPromptPrefixValidForModelContext";
import { makeChunksFitContext } from "./makeChunksFitContext";
import { OpenAI, generateAccountOpenAI } from "@/clients/openai_client";
import { SupportedApiKeys } from "@prisma/client";
import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { secretsManagerClient } from "@/clients/aws_secrets_manager_client";

const tpmDelay = 60000;

export async function openAiSummarizeFileInChunks(
  customizations: SummaryV3OpenAiCustomizations,
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
    p("Summarize v3 FILE_IN_CHUNKS", batchId);
    const start = Date.now();
    let inputTokens = 0,
      outputTokens = 0;
    const { format, length, language, model, chunkTokenOverlap } =
      customizations;
    job.progress(0);
    const { account, accountOpenAiApiKeyReference } =
      await guard_beforeRunningSummary(email, model);
    // vvv fetch account OPEN_AI_API_KEY from AWS Secrets Manager vvv
    const command = new GetSecretValueCommand({
      SecretId: accountOpenAiApiKeyReference?.secretId,
    });
    let secretsManagerResponse = null;
    try {
      secretsManagerResponse = await secretsManagerClient.send(command);
    } catch (e) {}
    // ^^^ ^^^
    const encoder = getEncoderForModel(model);
    const fileToText: { text: string; originalName: string } =
      await convertFileToTextFormat(file);
    const promptPrefix = generatePromptPrefix({ format, length, language });
    // prettier-ignore
    let summaryForFile: { file: string, summary: { chunk: number; chunkSummary: string }[] };
    let tpmAccum: number = 0;
    const originalNameOfFile = fileToText.originalName;
    // BREAK TEXT INTO CHUNKS SO
    // PROMPT_PREFIX + THE CHUNK IS WITHIN TOKEN LIMIT
    chunks = [fileToText.text];
    while (
      !areChunksWithPromptPrefixValidForModelContext(
        promptPrefix,
        chunks,
        CONFIG.models[model].context,
        encoder
      )
    ) {
      let newChunks = makeChunksFitContext(
        chunks,
        promptPrefix,
        CONFIG.models[model].context,
        encoder,
        chunkTokenOverlap
      );
      chunks = newChunks;
    }
    // WE NOW HAVE THE FILE IN CHUNKS THAT DON'T EXCEED THE MODEL CONTEXT LIMIT
    // SO WE LOOP OVER THE CHUNKS AND STORE THE SUMMARY OF EACH CHUNK
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
      await guard_beforeCallingModel(email, model);
      let completion;
      if (secretsManagerResponse?.SecretString) {
        // get OpenAI client with account OPEN_AI_API_KEY
        completion =
          await generateOpenAiUserChatCompletionWithExponentialBackoff(
            model,
            prompt,
            tpmDelay,
            generateAccountOpenAI(secretsManagerResponse?.SecretString!)
          );
      } else {
        // use static OpenAI client as account does NOT have an OPEN_AI_API_KEY
        await deductCostOfOpenAiInputTokens(
          promptTokenCount,
          model,
          config,
          account
        );
        completion =
          await generateOpenAiUserChatCompletionWithExponentialBackoff(
            model,
            prompt,
            tpmDelay,
            OpenAI
          );
      }
      const completionText: string =
        completion.data?.choices[0]?.message?.content || "ERROR: No Content";
      p(`snippet of last OpenAI completion - '${completionText.slice(0, 16)}'`);
      const outputTokenCount = encoder.encode(completionText).length;
      if (!secretsManagerResponse?.SecretString) {
        await deductCostOfOpenAiOutputTokens(
          outputTokenCount,
          model,
          config,
          account
        );
      }
      outputTokens += outputTokenCount; // track output tokens
      tpmAccum += outputTokenCount; // accumulate total tokens
      summarizedChunksOfFile.push({ chunk: i, chunkSummary: completionText });
      p("i", i, "chunks.length", chunks.length);
      job.progress(job.progress() + (1 / chunks.length) * 90);
      p("job.progress()", job.progress());
    }
    // prettier-ignore
    summaryForFile = ({ file: fileToText.originalName, summary: summarizedChunksOfFile });
    const { summaryV3Record } = await saveToDb(
      account,
      summaryForFile,
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
