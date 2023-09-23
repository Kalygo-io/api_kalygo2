import prisma from "@/db/prisma_client";
import { Tiktoken, encoding_for_model } from "@dqbd/tiktoken";
import { summaryJobComplete_SES_Config } from "@/emails/v2/summaryJobComplete";
import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "@/clients/ses_client";
import { SummaryMode } from "@prisma/client";
// import { generateBulletPointsPromptPrefix } from "./generateBulletPointsPromptPrefix";
// import { generatePromptPrefix } from "./generatePromptPrefix";
import { sleep } from "@/utils/sleep";
import CONFIG from "@/config";
import { SummaryV2OpenAiCustomizations } from "@/types/SummaryV2OpenAiCustomizations";
import { p } from "@/utils/p";
import { convertFilesToTextFormatWithMetadata } from "@/utils/convertFilesToTextFormatWithMetadata";
import { guard_beforeRunningSummary } from "../../../shared/guards/guard_beforeRunningSummary";
import { checkout } from "../../../shared/checkout";
// import { breakUpNextChunk } from "./breakUpNextChunk";
import { generateOpenAiUserChatCompletionWithExponentialBackoff } from "../../../shared/generateOpenAiUserChatCompletionWithExponentialBackoff";
import config from "@/config";
import { guard_beforeCallingModel } from "../../../shared/guards/guard_beforeCallingModel";
import { generatePromptPrefix } from "./generatePromptPrefix";
import { isChunkValidForModelContext } from "@/utils/isChunkValidForModelContext";

const tpmDelay = 60000;

export async function openAiSummarizeEachFilePerPage(
  customizations: SummaryV2OpenAiCustomizations,
  email: string,
  files: any[],
  bucket: string,
  job: any,
  locale: string,
  done: (err?: Error | null | undefined, result?: any) => void
) {
  try {
    p("Summarize Each File Overall"); // for console debugging...
    const start = Date.now();
    const { format, length, language, model } = customizations;
    job.progress(0);
    // -v-v- CHECK IF CALLER HAS AN ACCOUNT -v-v-
    const { account, customerId } = await guard_beforeRunningSummary(
      email,
      model
    );
    // -v-v- TRACK I/O TOKENS FOR BILLING -v-v-
    const encoder: Tiktoken = encoding_for_model(
      model === "gpt-3.5-turbo-16k" ? "gpt-3.5-turbo" : model
    );
    let inputTokens = 0;
    let outputTokens = 0;
    // -v-v- CONVERT ALL FILES TO TEXT-BASED FORMAT -v-v-
    const filesToText: {
      partsOfFile: any[];
      originalName: string;
    }[] = await convertFilesToTextFormatWithMetadata(files, bucket);
    p("splitting text.*.*."); // for console debugging...
    // -v-v- LOOP OVER THE TEXT-BASED VERSIONS OF EACH FILE -v-v-
    let summaryOfEachPartOfEachFile: {
      file: string;
      summariesOfTheParts: string[];
    }[] = [];
    let tpmAccum: number = 0; // for tracking TPM ie: tokens / minute
    for (let fIndex = 0; fIndex < filesToText.length; fIndex++) {
      const originalNameOfFile = filesToText[fIndex].originalName;
      // prettier-ignore
      p("*** file to be processed ***", originalNameOfFile);

      let summariesForPartsOfCurrentFile = [];
      let partsOfCurrentFile = filesToText[fIndex].partsOfFile.length;
      for (let part = 0; part < partsOfCurrentFile; part++) {
        const textInPartOfFile = filesToText[fIndex].partsOfFile[part].text;
        // console.log(textInPartOfFile);
        console.log("___ --- ___");

        let promptPrefix = generatePromptPrefix({
          format,
          length,
          language,
        });

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
          // -v-v- WE NOW HAVE EXCEEDED THE TOKENS / MINUTE LIMIT SO WE PAUSE -v-v-
          // prettier-ignore;
          if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) {
            // tpmBuffer is to control how close to the rate limit you want to get
            p(`sleeping for ${tpmDelay / 60000} minute(s)`); // for console debugging...
            await sleep(tpmDelay);
            tpmAccum = 0;
          }

          // -v-v- GUARD AND CONFIRM THAT BALANCE WILL NOT GET OVERDRAWN
          await guard_beforeCallingModel(email, model);

          // *** Deducting cost of INPUT TOKENS from credit balance ***
          const inputTokenCost =
            (nextPromptTokenCount /
              config.models[model].pricing.input.perTokens) *
            config.models[model].pricing.input.rate;
          console.log(
            "Cost of INPUT_TOKENS",
            inputTokenCost,
            account?.UsageCredits?.amount
          );
          console.log(
            "Now deducting from 'Cost of INPUT_TOKENS' from credits balance if no free credits exist..."
          ); // TODO collapse 'FREE CREDITS' and 'USAGE CREDITS' into one system
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
          p("call the A.I. model"); // for console debugging...
          let completion =
            await generateOpenAiUserChatCompletionWithExponentialBackoff(
              model,
              nextPrompt,
              tpmDelay
            );
          // prettier-ignore
          const completionText = completion.data?.choices[0]?.message?.content || "No Content"
          // prettier-ignore
          p(`snippet of last OpenAI completion - '${completionText.slice(0,16)}'`);
          // -v-v- TRACK THE OUTPUT TOKENS -v-v-
          const outputTokenCount = encoder.encode(completionText).length;
          // *** Deducting cost of OUTPUT_TOKENS from credit balance ***
          const outputTokenCost =
            (outputTokenCount / config.models[model].pricing.output.perTokens) *
            config.models[model].pricing.output.rate;
          console.log(
            "Cost of OUTPUT_TOKENS",
            outputTokenCost,
            account?.UsageCredits?.amount
          );
          // prettier-ignore
          console.log("now deducting 'Cost of OUTPUT_TOKENS' from credits balance...");
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
          // -v-v- STORING THE COMPLETION OF THIS PART OF THE FILE -v-v-
          summariesForPartsOfCurrentFile.push(completionText);
          // -v-v- UPDATE PROGRESS BAR -v-v-
          // prettier-ignore
          // prettier-ignore
          job.progress((part / partsOfCurrentFile) * (90 / files.length));
          p("progress:", job.progress());
        } else {
          throw new Error(
            "Prompt prefix plus text for part of file exceeds context of A.I. model"
          );
        }
      }

      summaryOfEachPartOfEachFile.push({
        file: originalNameOfFile,
        summariesOfTheParts: summariesForPartsOfCurrentFile,
      });
    }

    // -v-v- SAVE THE FINAL ANSWER TO DB -v-v-
    p("saving to db...");
    const summaryV2Record = await prisma.summaryV2.create({
      data: {
        requesterId: account!.id,
        summary: summaryOfEachPartOfEachFile,
        mode: SummaryMode.EACH_FILE_PER_PAGE,
        model: model,
        language: language,
        format: format,
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
    p("ERROR", (e as Error).toString());
    done(e as Error, null);
  }
}
