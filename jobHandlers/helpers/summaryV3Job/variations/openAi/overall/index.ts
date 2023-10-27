import { generatePromptPrefix } from "./generatePromptPrefix";
import { generateFinalSummarizationPrompt } from "./generateFinalSummarizationPrompt";
import { sleep } from "@/utils/sleep";
import CONFIG from "@/config";
import { SummaryV3OpenAiCustomizations } from "@/types/SummaryV3OpenAiCustomizations";
import { p } from "@/utils/p";
import { convertFilesToTextFormat } from "@/utils/convertFilesToTextFormat";
import { guard_beforeRunningSummary } from "../../../shared/guards/guard_beforeRunningSummary";
import { isChunkValidForModelContext } from "@/utils/isChunkValidForModelContext";
import { generateOpenAiUserChatCompletionWithExponentialBackoff } from "../../../shared/generateOpenAiUserChatCompletionWithExponentialBackoff";
import { checkout } from "../../../shared/checkout";
import { breakUpNextChunkForSummaryOfSummaries } from "./breakUpNextChunkForSummaryOfSummaries";
import { guard_beforeCallingModel } from "../../../shared/guards/guard_beforeCallingModel";
import config from "@/config";
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

export async function openAiSummarizeFilesOverall(
  customizations: SummaryV3OpenAiCustomizations,
  email: string,
  files: any[],
  job: any,
  batchId: string,
  locale: string,
  done: (err?: Error | null | undefined, result?: any) => void
) {
  try {
    p("Summary v3 OVERALL");
    const start = Date.now();
    let inputTokens = 0,
      outputTokens = 0;
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
    const filesToText: {
      text: string;
      originalName: string;
    }[] = await convertFilesToTextFormat(files);
    let summariesOfEachFile: {
      fileName: string;
      summary: string;
    }[] = [];
    let tpmAccum = 0;
    for (let fIndex = 0; fIndex < filesToText.length; fIndex++) {
      const originalNameOfFile = filesToText[fIndex].originalName;
      p("*** file to be processed ***", originalNameOfFile);
      let chunks = [filesToText[fIndex].text];
      let chunksCounter = 0;
      let summaryForFile = "";
      let tokenAccumWithoutPrefixForFile: number = 0;
      const totalTokenCountInFile: number = encoder.encode(chunks[0]).length;
      while (chunks.length > 0) {
        p("processing next chunk of the file...");
        let promptPrefix = generatePromptPrefix(
          {
            format: "paragraph",
            length: "long",
            language,
          },
          summaryForFile
        );
        while (
          !isChunkValidForModelContext(
            `${promptPrefix} ${chunks[0]}`,
            CONFIG.models[model].context,
            encoder
          )
        ) {
          chunks = breakOffMaxChunkForContext(
            promptPrefix,
            chunks,
            CONFIG.models[model].context,
            encoder
          );
        }
        tokenAccumWithoutPrefixForFile = encoder.encode(chunks[0]).length;
        p("WE HAVE NOW BIT OFF AN ACCEPTABLE CHUNK");
        const prompt = `${promptPrefix} ${chunks[0]}`;
        // prettier-ignore
        p("snippet of nextPrompt up for completion...", prompt.slice(0, 16));
        const promptTokenCount = encoder.encode(prompt).length;
        inputTokens += promptTokenCount; // track input tokens
        tpmAccum += promptTokenCount; // accumulate input tokens
        p(`tokens in chunk ${chunksCounter} of file`, promptTokenCount);
        p("tpmAccum", tpmAccum);
        if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) {
          await sleep(tpmDelay);
          tpmAccum = 0;
        }
        await guard_beforeCallingModel(email, model);
        let completion;
        if (!accountOpenAiApiKey) {
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
        tpmAccum += outputTokenCount; // accumulate total token count
        summaryForFile = completionText;
        // if additional chunks exist then grab the overlapping text
        // and prepend it to the subsequent chunk
        if (chunks.length > 1) {
          const overlapSegment: string = getOverlapSegment(
            chunkTokenOverlap,
            chunks[0],
            encoder
          );
          // prettier-ignore
          job.progress(job.progress() + (tokenAccumWithoutPrefixForFile - chunkTokenOverlap)  / totalTokenCountInFile * (90 / files.length)); // HACK BUT WORKS : )
          p("progress:", job.progress());
          chunks[1] = overlapSegment + chunks[1];
        } else {
          // prettier-ignore
          job.progress(job.progress() + ((tokenAccumWithoutPrefixForFile / totalTokenCountInFile) * (90 / files.length)));
          console.log(job.progress());
        }
        chunks.shift();
        chunksCounter += 1;
      }
      summariesOfEachFile.push({
        fileName: filesToText[fIndex].originalName,
        summary: summaryForFile,
      });
    }
    const summaryOfEachFileConcatenated: string = summariesOfEachFile
      .map((i) => {
        return `Here is the summary of ${i.fileName}: ${i.summary}`;
      })
      .join("\n\n");
    let chunks = [summaryOfEachFileConcatenated];
    let summaryOfSummaries: {
      part: number;
      summary: string;
    }[] = [];
    let summaryOfSummariesPartCounter = 0;
    while (chunks.length > 0) {
      let finalSummarizationPrompt = generateFinalSummarizationPrompt(
        {
          format,
          length,
          language,
        },
        chunks[0],
        summariesOfEachFile.length
      );
      while (
        !isChunkValidForModelContext(
          finalSummarizationPrompt,
          CONFIG.models[model].context,
          encoder
        )
      ) {
        breakUpNextChunkForSummaryOfSummaries(chunks, summariesOfEachFile);
      }
      const finalPrompt = generateFinalSummarizationPrompt(
        {
          format,
          length,
          language,
        },
        chunks[0], // ***
        summariesOfEachFile.length
      );
      p("*** snippet of finalPrompt... ***", finalPrompt.slice(0, 16));
      const finalPromptTokenCount = encoder.encode(finalPrompt).length;
      inputTokens += encoder.encode(finalPrompt).length;
      tpmAccum += encoder.encode(finalPrompt).length;
      if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) {
        await sleep(tpmDelay);
        tpmAccum = 0;
      }
      await guard_beforeCallingModel(email, model);

      let completion;
      if (!accountOpenAiApiKey) {
        // use static OpenAI client as account does NOT have an OPEN_AI_API_KEY

        await deductCostOfOpenAiInputTokens(
          finalPromptTokenCount,
          model,
          config,
          account
        );
        completion =
          await generateOpenAiUserChatCompletionWithExponentialBackoff(
            model,
            finalPrompt,
            tpmDelay,
            OpenAI
          );
      } else {
        completion =
          await generateOpenAiUserChatCompletionWithExponentialBackoff(
            model,
            finalPrompt,
            tpmDelay,
            generateAccountOpenAI(secretsManagerResponse?.SecretString!)
          );
      }
      const completionText =
        completion.data?.choices[0]?.message?.content || "No Content";
      const outputTokenCount = encoder.encode(completionText).length;
      deductCostOfOpenAiOutputTokens(outputTokenCount, model, config, account);
      outputTokens += outputTokenCount; // track output tokens
      tpmAccum += outputTokenCount; // accumulate output tokens
      // prettier-ignore
      p("snippet of completion of FINAL request...", completionText.slice(0, 16));
      // prettier-ignore
      summaryOfSummaries.push({ part: summaryOfSummariesPartCounter, summary: completionText });
      chunks.shift();
      summaryOfSummariesPartCounter++;
    }
    const { summaryV3Record } = await saveToDb(
      account,
      summaryOfSummaries,
      model,
      language,
      format,
      batchId,
      files
    );
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
