import prisma from "@/db/prisma_client";
import { Tiktoken, encoding_for_model } from "@dqbd/tiktoken";
import { summaryJobComplete_SES_Config } from "@/emails/v2/summaryJobComplete";
import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "@/clients/ses_client";
import { generatePromptPrefix } from "./generatePromptPrefix";
import { generateFinalSummarizationPrompt } from "./generateFinalSummarizationPrompt";
import { sleep } from "@/utils/sleep";
import CONFIG from "@/config";
import { p } from "@/utils/p";
import { convertFilesToTextFormat } from "@/utils/convertFilesToTextFormat";
import { guard_beforeRunningSummary } from "../../../shared/guards/guard_beforeRunningSummary";
import { isChunkValidForModelContext } from "@/utils/isChunkValidForModelContext";
import { breakUpNextChunk } from "./breakUpNextChunk";
import { generateOpenAiUserChatCompletionWithExponentialBackoff } from "../../../shared/generateOpenAiUserChatCompletionWithExponentialBackoff";
import { checkout } from "../../../shared/checkout";
import { breakUpNextChunkForSummaryOfSummaries } from "./breakUpNextChunkForSummaryOfSummaries";
import { ScanningMode } from "@prisma/client";
import { guard_beforeCallingModel } from "../../../shared/guards/guard_beforeCallingModel";
import config from "@/config";
import { SummaryV2ReplicateCustomizations } from "@/types/SummaryV2ReplicateCustomizations";
import llamaTokenizer from "@/utils/llama-tokenizer";
import { generateReplicateChatCompletionWithExponentialBackoff } from "../../../shared/generateReplicateChatCompletionWithExponentialBackoff";

const tpmDelay = 60000;

export async function replicateSummarizeFilesOverall(
  customizations: SummaryV2ReplicateCustomizations,
  email: string,
  files: any[],
  bucket: string,
  job: any,
  locale: string,
  done: (err?: Error | null | undefined, result?: any) => void
) {
  try {
    p("REPLICATE All Files Overall"); // for console debugging...
    console.log("Customizations: ", customizations);
    const start = Date.now();
    const { format, length, language, model } = customizations;
    job.progress(0);
    // -v-v- CHECK IF CALLER HAS AN ACCOUNT -v-v-
    const { account, customerId } = await guard_beforeRunningSummary(
      email,
      model
    );
    // -v-v- TRACK I/O TOKENS FOR BILLING -v-v-
    const encoder = llamaTokenizer;
    let inputTokens = 0;
    let outputTokens = 0;
    const filesToText: {
      text: string;
      originalName: string;
    }[] = await convertFilesToTextFormat(files);
    p("splitting text.*.*.");
    // -v-v- LOOP OVER THE TEXT-BASED VERSIONS OF EACH FILE -v-v-
    let summariesOfEachFile: {
      fileName: string;
      summary: string;
    }[] = [];
    let tpmAccum = 0;
    for (let fIndex = 0; fIndex < filesToText.length; fIndex++) {
      const originalNameOfFile = filesToText[fIndex].originalName;
      // prettier-ignore
      p("*** file to be processed ***", originalNameOfFile);
      // -v-v- LOGIC BELOW IS TO BREAK THE DATA IN EACH FILE INTO CHUNKS SO THAT THE PROMPT_PREFIX PLUS THE_CHUNK IS WITHIN THE MODEL INPUT TOKEN LIMIT -v-v-
      let chunks = [filesToText[fIndex].text];
      let chunksCounter = 0;
      let summaryForFile = ""; // ***
      let tokenAccumWithoutPrefixForFile: number = 0;
      const totalTokenCountInFile: number = encoder.encode(chunks[0]).length;
      // -v-v- IF A CHUNK OF THE FILE IS TOO LARGE FOR THE MODEL'S INPUT CONTEXT... -v-v-
      // -v-v- WE WILL SHIFT IT OFF THE CHUNKS ARRAY AND UNSHIFT IT BACK ON BROKEN IN HALF. -v-v-
      // -v-v- WE WILL BE SEQUENTIALLY MOVING THROUGH THE FILE DATA AND INCLUDING... -v-v-
      // -v-v- THE COMPLETION OF PREVIOUSLY PROCESSED CHUNKS WITH EACH SUBSEQUENT PROMPT. -v-v-
      while (chunks.length > 0) {
        p("processing next chunk of the file..."); // for console debugging...
        // -v-v- THIS IS THE PROMPT PREFIX THAT WILL BE APPLIED TO EACH CHUNK OF EACH FILE. -v-v-
        // -v-v- IT WILL INCLUDE THE COMPLETION OF PREVIOUSLY PROCESSED CHUNKS IN ORDER TO HELP REFINE AN OVERALL COMPLETION. -v-v-
        let promptPrefix = generatePromptPrefix(
          {
            format: "paragraph",
            length: "long",
            language,
          },
          summaryForFile // ***
        );
        // -v-v- LOGIC IS TO CHECK THAT THE PROMPT_PREFIX PLUS THE_CHUNK IS WITHIN THE MODEL INPUT TOKEN LIMIT -v-v-
        while (
          !isChunkValidForModelContext(
            `${promptPrefix} ${chunks[0]}`,
            CONFIG.models[model].context,
            encoder
          )
        ) {
          chunks = breakUpNextChunk(chunks);
        }
        // -v-v- WE HAVE NOW BIT OFF AN ACCEPTABLE CHUNK -v-v-
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
        // -v-v- WE NOW HAVE EXCEEDED THE TOKENS / MINUTE LIMIT SO WILL PAUSE FOR 1 MINUTE -v-v-
        // prettier-ignore
        if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) { // tpmBuffer is to control how close to the rate limit you want to get
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
          "Cost of INPUT_TOKENS - now deducting from credits balance)",
          inputTokenCost,
          account?.UsageCredits?.amount
        );
        // ***
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
        // *^*^*

        // -v-v- CALL THE A.I. MODEL -v-v-
        let completion =
          await generateReplicateChatCompletionWithExponentialBackoff(
            model,
            nextPrompt,
            tpmDelay
          );

        console.log("DEBUG LLaMa 2 completion", completion);

        const completionText: string =
          // @ts-ignore
          completion?.join("") || "ERROR: No Content";
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
        job.progress(job.progress() + ((tokenAccumWithoutPrefixForFile / totalTokenCountInFile) * (90 / files.length)));
        console.log(job.progress());
        // -v-v- MOVE ON TO NEXT CHUNK OF THE FILE TO SYNTHESIZE INTO AN OVERALL SUMMARY -v-v-
        chunks.shift();
      }
      // -v-v- STORE OVERALL SUMMARY OF FILE -v-v-
      // -v-v- BUILD AN ARRAY THAT STORES THE SUMMARY OF EACH FILE -v-v-
      summariesOfEachFile.push({
        fileName: filesToText[fIndex].originalName,
        summary: summaryForFile,
      });
    }
    // vvv vvv vvv *** FINAL SUMMARIZATION OF SUMMARIES *** vvv vvv vvv
    const summaryOfEachFileConcatenated: string = summariesOfEachFile
      .map((i) => {
        return `Here is the summary of ${i.fileName}: ${i.summary}`;
      })
      .join("\n\n");
    p("summaryOfEachFileConcatenated", summaryOfEachFileConcatenated);
    let chunks = [summaryOfEachFileConcatenated];
    let summaryOfSummaries: {
      part: number;
      summary: string;
    }[] = []; // ***
    let summaryOfSummariesPartCounter = 0; // for the final step aka summarizing the summaries
    while (chunks.length > 0) {
      p("outer while...");
      let finalSummarizationPrompt = generateFinalSummarizationPrompt(
        {
          format: "paragraph",
          length: "long",
          language,
        },
        chunks[0], // include the summaries of each file for context when prompting the model to synthesize them all
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
      // -v-v- WE HAVE NOW BIT OFF AN ACCEPTABLE CHUNK -v-v-
      p("WE HAVE NOW BIT OFF AN ACCEPTABLE CHUNK");
      p("final Summarization prompt parameters", {
        format,
        length,
        language,
      });

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
      p("tokens to be sent", finalPromptTokenCount);
      inputTokens += encoder.encode(finalPrompt).length;
      tpmAccum += encoder.encode(finalPrompt).length;
      if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) {
        // tpmBuffer is to control how close to the rate limit you want to get
        await sleep(tpmDelay);
        tpmAccum = 0;
      }

      // -v-v- GUARD AND CONFIRM THAT BALANCE WILL NOT GET OVERDRAWN
      await guard_beforeCallingModel(email, model);
      // *** Deducting cost of INPUT TOKENS from credit balance ***
      const inputTokenCost =
        (finalPromptTokenCount / config.models[model].pricing.input.perTokens) *
        config.models[model].pricing.input.rate;
      console.log(
        "Cost of INPUT_TOKENS - now deducting from credits balance)",
        inputTokenCost,
        account?.UsageCredits?.amount
      );

      // ***
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
      // ***

      // -v-v- CALL THE A.I. MODEL -v-v-
      let completion =
        await generateReplicateChatCompletionWithExponentialBackoff(
          model,
          finalPrompt,
          tpmDelay
        );

      console.log("DEBUG LLaMa 2 completion", completion);

      const completionText: string =
        // @ts-ignore
        completion?.join("") || "ERROR: No Content";
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
      // ***
      outputTokens += outputTokenCount; // track output tokens
      tpmAccum += outputTokenCount; // accumulate output tokens
      // prettier-ignore
      p("snippet of completion of FINAL request...", completionText.slice(0, 16));
      // prettier-ignore
      summaryOfSummaries.push({ part: summaryOfSummariesPartCounter, summary: completionText });
      p("*** summaryOfSummariesPartCounter ***", summaryOfSummariesPartCounter);
      chunks.shift();
      summaryOfSummariesPartCounter++;
    }
    // -v-v- SAVE THE FINAL ANSWER TO DB -v-v-
    p("saving to db...");
    const summaryV2Record = await prisma.summaryV2.create({
      data: {
        requesterId: account!.id,
        summary: summaryOfSummaries,
        scanMode: ScanningMode.OVERALL,
        title: filesToText.map((f) => f.originalName).join(" "),
        model: model,
        language: language,
        format: format,
      },
    });
    // -v-v- SEND AN EMAIL NOTIFICATION -v-v-
    p("send an email notification...");
    // Send an email
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
