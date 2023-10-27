import { generateBulletPointsPromptPrefix } from "./generateBulletPointsPromptPrefix";
import { generatePromptPrefix } from "./generatePromptPrefix";
import { sleep } from "@/utils/sleep";
import CONFIG from "@/config";
import { p } from "@/utils/p";
import { isChunkValidForModelContext } from "@/utils/isChunkValidForModelContext";
import { guard_beforeRunningSummary } from "../../../shared/guards/guard_beforeRunningSummary";
import { checkout } from "../../../shared/checkout";
import { generateOpenAiUserChatCompletionWithExponentialBackoff } from "../../../shared/generateOpenAiUserChatCompletionWithExponentialBackoff";
import config from "@/config";
import { guard_beforeCallingModel } from "../../../shared/guards/guard_beforeCallingModel";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";
import { getEncoderForModel } from "../../../shared/getEncoderForModel";
import { convertFileToTextFormat } from "@/utils/convertFileToTextFormat";
import { breakOffMaxChunkForContext } from "./breakOffMaxChunkForContext";
import { SummaryV3OpenAiCustomizations } from "@/types/SummaryV3OpenAiCustomizations";
import { saveToDb } from "./saveToDb";
import { getOverlapSegment } from "../../../shared/getOverlapSegment";
import { deductCostOfOpenAiOutputTokens } from "../../../shared/deductCostOfOpenAiOutputTokens";
import { deductCostOfOpenAiInputTokens } from "../../../shared/deductCostOfOpenAiInputTokens";
import { SupportedApiKeys } from "@prisma/client";
import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { secretsManagerClient } from "@/clients/aws_secrets_manager_client";
import { OpenAI, generateAccountOpenAI } from "@/clients/openai_client";

const tpmDelay = 60000;

export async function openAiSummarizeFileOverall(
  customizations: SummaryV3OpenAiCustomizations,
  email: string,
  file: Express.Multer.File & { bucket: string; key: string; etag: string },
  job: any,
  batchId: string,
  locale: string,
  done: (err?: Error | null | undefined, result?: any) => void
) {
  try {
    p("Summarize v3 FILE_OVERALL", batchId);
    const start = Date.now();
    let inputTokens = 0,
      outputTokens = 0;
    const { format, length, language, model, chunkTokenOverlap } =
      customizations;
    job.progress(0);
    // prettier-ignore
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
    // prettier-ignore
    const fileToText: { text: string; originalName: string; } = await convertFileToTextFormat(file);
    let tpmAccum: number = 0;
    p("*** name of file ***", fileToText.originalName);
    // prettier-ignore
    const totalTokenCountInFile: number = encoder.encode(fileToText.text).length;
    let chunks: string[] = [fileToText.text],
      chunksCounter: number = 0,
      summaryForFile: string = "",
      currentChunkTokenCount: number = 0;
    // IF CHUNK EXCEEDS MODEL INPUT CONTEXT, THEN SHIFT IT OFF THE CHUNKS ARRAY AND UNSHIFT IT BACK ON BROKEN IN 'HALF'
    // ie: 1st half is max length for context and 2nd half is rest
    while (chunks.length > 0) {
      p("processing next chunk of the file...");
      // prettier-ignore
      const promptPrefix = generatePromptPrefix({ format: "paragraph", length, language }, summaryForFile);
      // CHECK THE PROMPT + THE CHUNK IS WITHIN THE MODEL'S INPUT TOKEN LIMIT
      while (
        // prettier-ignore
        !isChunkValidForModelContext(`${promptPrefix} ${chunks[0]}`, CONFIG.models[model].context, encoder)
      ) {
        console.log("breaking off MAX chunk for context...");
        // prettier-ignore
        chunks = breakOffMaxChunkForContext(promptPrefix, chunks, CONFIG.models[model].context, encoder);
      }
      currentChunkTokenCount = encoder.encode(chunks[0]).length; // for calculating progress
      const prompt = `${promptPrefix} ${chunks[0]}`;
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
      await guard_beforeCallingModel(email, model); // GUARD AND CONFIRM THAT BALANCE WILL NOT GET OVERDRAWN
      let completion;
      if (accountOpenAiApiKey && secretsManagerResponse?.SecretString) {
        console.log("Use account OPEN_AI_API_KEY");
        // get OpenAI client with account OPEN_AI_API_KEY
        completion =
          await generateOpenAiUserChatCompletionWithExponentialBackoff(
            model,
            prompt,
            tpmDelay,
            generateAccountOpenAI(secretsManagerResponse?.SecretString!)
          );
      } else {
        console.log("Default to use default OPEN_AI_API_KEY");
        // use static OpenAI client as account does NOT have an OPEN_AI_API_KEY
        await deductCostOfOpenAiInputTokens(
          promptTokenCount,
          model,
          config,
          account
        );
        console.log("calling OpenAI...");
        completion =
          await generateOpenAiUserChatCompletionWithExponentialBackoff(
            model as SupportedOpenAiModels,
            prompt,
            tpmDelay,
            OpenAI
          );
      }
      let completionText: string =
        completion.data?.choices[0]?.message?.content || "No Content";
      p(`snippet of last OpenAI completion - '${completionText.slice(0, 16)}'`);
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
      tpmAccum += outputTokenCount; // accumulate total tokens
      summaryForFile = completionText;
      p("currentChunkTokenCount", currentChunkTokenCount);
      p("totalTokenCountInFile", totalTokenCountInFile);
      // if additional chunks exist then grab the overlapping text
      // and prepend it to the subsequent chunk
      if (chunks.length > 1) {
        console.log("chunks.length > 1 so getting overlap segment...");
        const overlapSegment: string = getOverlapSegment(
          chunkTokenOverlap,
          chunks[0],
          encoder
        );
        // prettier-ignore
        job.progress(job.progress() + (currentChunkTokenCount - chunkTokenOverlap)  / totalTokenCountInFile * 90); // HACK BUT WORKS : )
        p("progress:", job.progress());
        chunks[1] = overlapSegment + chunks[1];
      } else {
        console.log("chunks.length == 1...");
        // prettier-ignore
        job.progress(job.progress() + currentChunkTokenCount / totalTokenCountInFile * 90);
        p("progress:", job.progress());
      }
      console.log("moving onto the next chunk...");
      chunks.shift();
      chunksCounter++;
    }
    if (format === "bullet-points") {
      // prettier-ignore
      const prompt = generateBulletPointsPromptPrefix({ length, language, }, summaryForFile); // TODO - handle scenario where summaryForFile exceeds context
      const promptTokenCount = encoder.encode(prompt).length;
      p("finalBulletPointsPromptTokenCount", promptTokenCount);
      inputTokens += promptTokenCount;
      tpmAccum += promptTokenCount;
      if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) {
        await sleep(tpmDelay);
        tpmAccum = 0;
      }
      await guard_beforeCallingModel(email, model);
      let completion;
      if (accountOpenAiApiKey && secretsManagerResponse?.SecretString) {
        console.log("Use account OPEN_AI_API_KEY");
        completion =
          await generateOpenAiUserChatCompletionWithExponentialBackoff(
            model as SupportedOpenAiModels,
            prompt,
            tpmDelay,
            generateAccountOpenAI(secretsManagerResponse?.SecretString!)
          );
      } else {
        console.log("Default to use default OPEN_AI_API_KEY");
        // use static OpenAI client as account does NOT have an OPEN_AI_API_KEY
        deductCostOfOpenAiInputTokens(promptTokenCount, model, config, account);
        completion =
          await generateOpenAiUserChatCompletionWithExponentialBackoff(
            model as SupportedOpenAiModels,
            prompt,
            tpmDelay,
            OpenAI
          );
      }
      let finalBulletPointsCompletionText =
        completion.data?.choices[0]?.message?.content || "ERROR: No Content";
      const outputTokenCount = encoder.encode(
        finalBulletPointsCompletionText
      ).length;
      if (!accountOpenAiApiKey) {
        await deductCostOfOpenAiOutputTokens(
          outputTokenCount,
          model,
          config,
          account
        );
      }
      outputTokens += outputTokenCount; // track output tokens
      tpmAccum += outputTokenCount; // accumulate total tokens
      // prettier-ignore
      p("snippet of final bullet points", finalBulletPointsCompletionText.slice(0, 16));
      summaryForFile = finalBulletPointsCompletionText;
    }
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
    done(e as Error, null);
  }
}
