import prisma from "@/db/prisma_client";
import { summaryJobComplete_SES_Config } from "@/emails/v2/summaryJobComplete";
import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "@/clients/ses_client";
import { SummaryMode } from "@prisma/client";
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
import {
  supportedOpenAiModels,
  supportedReplicateModels,
} from "@/config/models";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";
import { SupportedReplicateModels } from "@/types/SupportedReplicateModels";
import { generateReplicateChatCompletionWithExponentialBackoff } from "../../../shared/generateReplicateChatCompletionWithExponentialBackoff";
import { getEncoderForModel } from "../../../shared/getEncoderForModel";
import { convertFileToTextFormat } from "@/utils/convertFileToTextFormat";
import { SummaryV2OpenAiCustomizations } from "@/types/SummaryV2OpenAiCustomizations";
import { breakOffMaxChunkForContext } from "./breakOffMaxChunkForContext";

const tpmDelay = 60000;

export async function openAiSummarizeFileOverall(
  customizations: SummaryV2OpenAiCustomizations,
  email: string,
  file: Record<string, any>,
  bucket: string,
  job: any,
  locale: string,
  done: (err?: Error | null | undefined, result?: any) => void
) {
  try {
    p("Summarize File Overall");
    const start = Date.now(); // Track timing
    // Track I/O tokens
    let inputTokens = 0,
      outputTokens = 0;
    const { format, length, language, model } = customizations; // extract customizations
    job.progress(0); // reset jobProgress to 0%
    // prettier-ignore
    const { account, customerId } = await guard_beforeRunningSummary(email, model);
    const encoder = getEncoderForModel(model);
    // prettier-ignore
    const fileToText: { text: string; originalName: string; } = await convertFileToTextFormat(file, bucket);
    let tpmAccum: number = 0; // for tracking TPM ie: tokens / minute
    const originalNameOfFile = fileToText.originalName;
    p("*** file to be processed ***", originalNameOfFile);
    // -v-v- LOGIC BELOW IS TO BREAK THE DATA IN EACH FILE INTO CHUNKS SO THAT THE PROMPT_PREFIX PLUS THE_CHUNK IS WITHIN THE MODEL INPUT TOKEN LIMIT -v-v-
    let chunks = [fileToText.text];
    let chunksCounter = 0;
    let summaryForFile = ""; // ***
    let tokenAccumWithoutPrefixForFile: number = 0;
    const totalTokenCountInFile: number = encoder.encode(chunks[0]).length;
    // -v-v- IF A CHUNK OF THE FILE IS TOO LARGE FOR THE MODEL'S INPUT CONTEXT... -v-v-
    // -v-v- WE WILL SHIFT IT OFF THE CHUNKS ARRAY AND UNSHIFT IT BACK ON BROKEN IN HALF. -v-v-
    while (chunks.length > 0) {
      p("processing next chunk of the file..."); // for console debugging...
      // -v-v- THIS IS THE PROMPT PREFIX THAT WILL BE APPLIED TO EACH CHUNK OF EACH FILE. -v-v-
      // -v-v- IT WILL INCLUDE THE COMPLETION OF PREVIOUSLY PROCESSED CHUNKS IN ORDER TO HELP REFINE AN OVERALL COMPLETION. -v-v-
      // prettier-ignore
      let promptPrefix = generatePromptPrefix({ format: "paragraph", length, language, }, summaryForFile);
      // -v-v- LOGIC IS TO CHECK THAT THE PROMPT_PREFIX PLUS THE_CHUNK IS WITHIN THE MODEL INPUT TOKEN LIMIT -v-v-
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

        debugger;
      }
      // -v-v- WE HAVE NOW BIT OFF AN ACCEPTABLE CHUNK -v-v-
      tokenAccumWithoutPrefixForFile = encoder.encode(chunks[0]).length;
      p("WE HAVE NOW BIT OFF AN ACCEPTABLE CHUNK"); // for console debugging...
      const nextPrompt = `${promptPrefix} ${chunks[0]}`;
      // prettier-ignore
      p("snippet of the next prompt up for completion...", nextPrompt.slice(0, 16));
      const nextPromptTokenCount = encoder.encode(nextPrompt).length;
      chunksCounter += 1;
      inputTokens += nextPromptTokenCount; // track input tokens
      tpmAccum += nextPromptTokenCount; // accumulate input tokens
      // prettier-ignore
      p(`token length of prompt for next part ${chunksCounter} of file`, nextPromptTokenCount);
      // prettier-ignore
      p("inputTokens", inputTokens, "outputTokens", outputTokens, "tpmAccum", tpmAccum);
      // PAUSE WHEN EXCEEDEDING THE A.I. MODEL TPM LIMIT
      if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) {
        p(`sleeping for ${tpmDelay / 60000} minute(s)`);
        await sleep(tpmDelay);
        tpmAccum = 0; // reset the TPM LIMIT
      }
      // -v-v- GUARD AND CONFIRM THAT BALANCE WILL NOT GET OVERDRAWN
      await guard_beforeCallingModel(email, model);
      // *** Deducting cost of INPUT TOKENS from credit balance ***
      const inputTokenCost =
        (nextPromptTokenCount / config.models[model].pricing.input.perTokens) *
        config.models[model].pricing.input.rate;
      console.log(
        "Cost of INPUT_TOKENS - now deducting from credits balance)",
        inputTokenCost,
        account?.UsageCredits?.amount
      );
      // ***
      if (!account?.SummaryCredits?.amount) {
        await prisma.usageCredits.update({
          data: {
            amount: {
              decrement: inputTokenCost * 100, // * 100 as Usage credits are denominated in pennies
            },
          },
          where: {
            accountId: account?.id,
          },
        });
      }
      // ***
      // -v-v- CALL THE A.I. MODEL -v-v-
      let completion;
      let completionText: string;
      p("call the A.I. model"); // for console debugging...
      completion = await generateOpenAiUserChatCompletionWithExponentialBackoff(
        model as SupportedOpenAiModels,
        nextPrompt,
        tpmDelay
      );
      // prettier-ignore
      completionText = completion.data?.choices[0]?.message?.content || "No Content"
      // prettier-ignore
      p(`snippet of last OpenAI completion - '${completionText.slice(0,16)}'`);
      // -v-v- TRACK THE OUTPUT TOKENS -v-v-
      const outputTokenCount = encoder.encode(completionText).length;
      // *** Deducting cost of OUTPUT_TOKENS from credit balance ***
      const outputTokenCost =
        (outputTokenCount / config.models[model].pricing.output.perTokens) *
        config.models[model].pricing.output.rate;
      console.log(
        "Cost of OUTPUT_TOKENS - now deducting from credits balance...",
        outputTokenCost,
        account?.UsageCredits?.amount
      );
      // ***
      if (!account?.SummaryCredits?.amount) {
        await prisma.usageCredits.update({
          data: {
            amount: {
              decrement: outputTokenCost * 100, // * 100 as Usage credits are denominated in pennies
            },
          },
          where: {
            accountId: account?.id,
          },
        });
      }
      // ***
      outputTokens += outputTokenCount; // track output tokens
      tpmAccum += outputTokenCount; // accumulate output tokens
      // -v-v- STORING THE COMPLETION SO IT CAN BE INCORPORATED INTO THE NEXT PROMPT -v-v-
      summaryForFile = completionText;
      // -v-v- UPDATE PROGRESS BAR -v-v-
      // prettier-ignore
      p("tokenAccumWithoutPrefixForFile", tokenAccumWithoutPrefixForFile); // for console debugging...
      // prettier-ignore
      p("totalTokenCountInFile", totalTokenCountInFile); // for console debugging...
      // prettier-ignore
      job.progress(job.progress() + ((tokenAccumWithoutPrefixForFile / totalTokenCountInFile) * (90)));
      p("progress:", job.progress());
      // -v-v- MOVE ON TO NEXT CHUNK OF THE FILE TO SYNTHESIZE INTO AN OVERALL SUMMARY -v-v-
      chunks.shift();
    }
    // TODO: recursively breakup summary in case it is too large for final prompt
    if (format === "bullet-points") {
      let bulletPointsPromptPrefix = generateBulletPointsPromptPrefix(
        {
          length,
          language,
        },
        summaryForFile
      );
      const finalBulletPointsPrompt = `${bulletPointsPromptPrefix}`;
      // prettier-ignore
      const finalBulletPointsPromptTokenCount = encoder.encode(finalBulletPointsPrompt).length;

      // *** Deducting cost of INPUT TOKENS from credit balance ***
      const inputTokenCost =
        (finalBulletPointsPromptTokenCount /
          config.models[model].pricing.input.perTokens) *
        config.models[model].pricing.input.rate;
      console.log(
        "Cost of processing INPUT_TOKENS (finalPromptInput) - now deducting from credits balance...",
        inputTokenCost,
        account?.UsageCredits?.amount
      );

      // ***
      if (!account?.SummaryCredits?.amount) {
        await prisma.usageCredits.update({
          data: {
            amount: {
              decrement: inputTokenCost * 100, // * 100 as Usage credits are denominated in pennies
            },
          },
          where: {
            accountId: account?.id,
          },
        });
      }
      // ***
      // prettier-ignore
      p("finalBulletPointsPromptTokenCount", finalBulletPointsPromptTokenCount); // for console debugging...
      inputTokens += finalBulletPointsPromptTokenCount;
      tpmAccum += finalBulletPointsPromptTokenCount;
      if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) {
        // tpmBuffer is to control how close to the rate limit you want to get
        await sleep(tpmDelay);
        tpmAccum = 0;
      }

      // -v-v- GUARD AND CONFIRM THAT BALANCE WILL NOT GET OVERDRAWN
      await guard_beforeCallingModel(email, model);

      let completion;
      let finalBulletPointsCompletionText;

      // CALL THE A.I. MODEL
      console.log("calling the A.I. model...");
      completion = await generateOpenAiUserChatCompletionWithExponentialBackoff(
        model as SupportedOpenAiModels,
        finalBulletPointsPrompt,
        tpmDelay
      );

      // ***
      finalBulletPointsCompletionText =
        completion.data?.choices[0]?.message?.content || "ERROR: No Content";

      // -v-v- TRACK THE OUTPUT TOKENS -v-v-
      const finalBulletPointsCompletionTextTokenCount = encoder.encode(
        finalBulletPointsCompletionText
      ).length;

      outputTokens += finalBulletPointsCompletionTextTokenCount;
      tpmAccum += finalBulletPointsCompletionTextTokenCount;
      // *** Deducting cost of OUTPUT_TOKENS from credit balance ***
      const outputTokenCost =
        (finalBulletPointsCompletionTextTokenCount /
          config.models[model].pricing.output.perTokens) *
        config.models[model].pricing.output.rate;
      console.log(
        "Cost of OUTPUT_TOKENS - now deducting from credits balance...",
        outputTokenCost,
        account?.UsageCredits?.amount
      );

      // ***
      if (!account?.SummaryCredits?.amount) {
        await prisma.usageCredits.update({
          data: {
            amount: {
              decrement: outputTokenCost * 100, // * 100 as Usage credits are denominated in pennies
            },
          },
          where: {
            accountId: account?.id,
          },
        });
      }
      // ***

      // prettier-ignore
      p("snippet of completion of final bullet points generation request", finalBulletPointsCompletionText.slice(0, 16));
      summaryForFile = finalBulletPointsCompletionText;
    }

    // -v-v- SAVE THE FINAL ANSWER TO DB -v-v-
    p("saving to db...");
    const summaryV2Record = await prisma.summaryV2.create({
      data: {
        requesterId: account!.id,
        summary: summaryForFile,
        mode: SummaryMode.FILE_OVERALL,
        model: model,
        language: language,
        format: format,
      },
    });

    // Save the files for reference
    await prisma.file.create({
      data: {
        summaryId: summaryV2Record.id,
        originalName: file.originalname,
        bucket: file.bucket,
        key: file.key,
        hash: file.etag,
        ownerId: account?.id,
      },
    });

    // -v-v- SEND AN EMAIL NOTIFICATION -v-v-
    p("send an email notification...");
    job.progress(95);
    try {
      const emailConfig = summaryJobComplete_SES_Config(
        email,
        `${process.env.FRONTEND_HOSTNAME}/dashboard/summary-v2?summary-v2-id=${summaryV2Record.id}`,
        locale
      );
      await sesClient.send(new SendTemplatedEmailCommand(emailConfig));
      p("email sent");
    } catch (e) {}
    // -v-v- CHARGE THE CALLER FOR THE FANTASTIC SERVICE -v-v-
    p("*** CHECKOUT ***");
    await checkout(
      inputTokens,
      outputTokens,
      CONFIG.models[model].pricing,
      account,
      "usd",
      "SummaryV2",
      customerId
    );
    job.progress(100);
    p("DONE");
    const end = Date.now();
    // prettier-ignore
    console.log(`Execution time: ${end - start} ms or ${(end - start) / 1000 / 60} minutes`);
    done(null, { summaryV2Id: summaryV2Record.id });
  } catch (e) {
    done(e as Error, null);
  }
}
