import prisma from "@/db/prisma_client";
import { Tiktoken, encoding_for_model } from "@dqbd/tiktoken";
import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "@/clients/ses_client";
import { ScanningMode } from "@prisma/client";
import { sleep } from "@/utils/sleep";
import CONFIG from "@/config";
import { p } from "@/utils/p";
import { convertFilesToTextFormat } from "@/utils/convertFilesToTextFormat";
import { isChunkValidForModelContext } from "@/utils/isChunkValidForModelContext";
import { guard_beforeRunningCustomRequest } from "../../shared/guards/guard_beforeRunningCustomRequest";
import { checkout } from "../../shared/checkout";
import { breakUpNextChunk } from "./breakUpNextChunk";
import { generateOpenAiUserChatCompletionWithExponentialBackoff } from "../../shared/generateOpenAiUserChatCompletionWithExponentialBackoff";
import config from "@/config";
import { guard_beforeCallingModel } from "../../shared/guards/guard_beforeCallingModel";
import { CustomRequestCustomizations } from "@/types/CustomRequestCustomizations";
import { customRequestJobComplete_SES_Config } from "@/emails/v2/customRequestJobComplete";

const tpmDelay = 60000;

export async function eachFileOverall(
  customizations: CustomRequestCustomizations,
  email: string,
  files: any[],
  bucket: string,
  job: any,
  locale: string,
  done: (err?: Error | null | undefined, result?: any) => void
) {
  try {
    p("Each File Overall"); // for console debugging...
    const start = Date.now();
    const { prompt, model, finalPrompt } = customizations;
    job.progress(0);
    // -v-v- CHECK IF CALLER HAS AN ACCOUNT -v-v-
    const { account, customerId } = await guard_beforeRunningCustomRequest(
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
      text: string;
      originalName: string;
    }[] = await convertFilesToTextFormat(files);
    p("splitting text.*.*."); // for console debugging...
    // -v-v- LOOP OVER THE TEXT-BASED VERSIONS OF EACH FILE -v-v-
    let completionForEachFile: {
      file: string;
      finalCompletionForFile: string;
    }[] = [];
    let tpmAccum: number = 0; // for tracking TPM ie: tokens / minute
    for (let fIndex = 0; fIndex < filesToText.length; fIndex++) {
      const originalNameOfFile = filesToText[fIndex].originalName;
      // prettier-ignore
      p("*** file to be processed ***", originalNameOfFile);
      // -v-v- LOGIC BELOW IS TO BREAK THE DATA IN EACH FILE INTO CHUNKS SO THAT THE PROMPT_PREFIX PLUS THE_CHUNK IS WITHIN THE MODEL INPUT TOKEN LIMIT -v-v-
      let chunks = [filesToText[fIndex].text];
      let chunksCounter = 0;
      let contextForFile = ""; // ***
      let finalCompletionForFile = "";
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
        let promptPrefix = contextForFile
          ? `${contextForFile && `PREVIOUS CONTEXT: ${contextForFile}`}
        
PROMPT: ${prompt}

DATA:`
          : `PROMPT: ${prompt}

DATA:`;

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
        const nextPrompt = `${promptPrefix}
${chunks[0]}`;
        // prettier-ignore
        p("snippet of the next prompt up for completion...", nextPrompt.slice(0, 16));
        const nextPromptTokenCount = encoder.encode(nextPrompt).length;
        chunksCounter += 1;
        inputTokens += nextPromptTokenCount; // track input tokens
        tpmAccum += nextPromptTokenCount; // accumulate input tokens
        // prettier-ignore
        p(`token length of prompt for next part ${chunksCounter} of file`, nextPromptTokenCount);
        p("inputTokens", inputTokens);
        p("outputTokens", outputTokens);
        p("tpmAccum", tpmAccum);
        // -v-v- WE NOW HAVE EXCEEDED THE TOKENS / MINUTE LIMIT SO WE PAUSE -v-v-
        // prettier-ignore
        if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) { // tpmBuffer is to control how close to the rate limit you want to get
          p(`sleeping for ${tpmDelay / 60000} minute(s)`) // for console debugging...
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
        if (!account?.CustomRequestCredits?.amount) {
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
          "Cost of OUTPUT_TOKENS - now deducting from credits balance...",
          outputTokenCost,
          account?.UsageCredits?.amount
        );
        // ***
        if (!account?.CustomRequestCredits?.amount) {
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
        contextForFile = completionText;
        // -v-v- UPDATE PROGRESS BAR -v-v-
        // prettier-ignore
        p("tokenAccumWithoutPrefixForFile", tokenAccumWithoutPrefixForFile); // for console debugging...
        // prettier-ignore
        p("totalTokenCountInFile", totalTokenCountInFile); // for console debugging...
        // prettier-ignore
        job.progress(job.progress() + ((tokenAccumWithoutPrefixForFile / totalTokenCountInFile) * (90 / files.length)));
        p("progress:", job.progress());
        // -v-v- MOVE ON TO NEXT CHUNK OF THE FILE TO SYNTHESIZE INTO AN OVERALL SUMMARY -v-v-
        chunks.shift();
      }
      // TODO: recursively breakup summary in case it is too large for final prompt
      if (finalPrompt) {
        let finalPromptPrefix = finalPrompt;
        const finalPromptForCompletion = `PROMPT: ${finalPromptPrefix}
        
DATA: ${contextForFile}`;
        // prettier-ignore
        const finalPromptTokenCount = encoder.encode(finalPromptForCompletion).length;

        // *** Deducting cost of INPUT TOKENS from credit balance ***
        const inputTokenCost =
          (finalPromptTokenCount /
            config.models[model].pricing.input.perTokens) *
          config.models[model].pricing.input.rate;
        console.log(
          "Cost of processing INPUT_TOKENS (finalPromptInput) - now deducting from credits balance...",
          inputTokenCost,
          account?.UsageCredits?.amount
        );

        // ***
        if (!account?.CustomRequestCredits?.amount) {
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
        p("finalBulletPointsPromptTokenCount", finalPromptTokenCount); // for console debugging...
        inputTokens += finalPromptTokenCount;
        tpmAccum += finalPromptTokenCount;
        if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) {
          // tpmBuffer is to control how close to the rate limit you want to get
          await sleep(tpmDelay);
          tpmAccum = 0;
        }

        // -v-v- GUARD AND CONFIRM THAT BALANCE WILL NOT GET OVERDRAWN
        guard_beforeCallingModel(email, model);

        // CALL THE A.I. MODEL
        console.log("calling the A.I. model...");
        let completion =
          await generateOpenAiUserChatCompletionWithExponentialBackoff(
            model,
            finalPromptForCompletion,
            tpmDelay
          );

        // ***
        const finalCompletionText =
          completion.data?.choices[0]?.message?.content || "ERROR: No Content";

        // -v-v- TRACK THE OUTPUT TOKENS -v-v-
        const finalCompletionTextTokenCount =
          encoder.encode(finalCompletionText).length;

        outputTokens += finalCompletionTextTokenCount;
        tpmAccum += finalCompletionTextTokenCount;
        // *** Deducting cost of OUTPUT_TOKENS from credit balance ***
        const outputTokenCost =
          (finalCompletionTextTokenCount /
            config.models[model].pricing.output.perTokens) *
          config.models[model].pricing.output.rate;
        console.log(
          "Cost of OUTPUT_TOKENS - now deducting from credits balance...",
          outputTokenCost,
          account?.UsageCredits?.amount
        );
        // ***
        if (!account?.CustomRequestCredits?.amount) {
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
        p("snippet of completion of final generation request", finalCompletionText.slice(0, 16));
        finalCompletionForFile = finalCompletionText;
      } else {
        finalCompletionForFile = contextForFile;
      }
      // -v-v- BUILD THE FINAL ANSWER THE CALLER WANTS -v-v-
      // prettier-ignore
      completionForEachFile.push({ file: filesToText[fIndex].originalName, finalCompletionForFile: finalCompletionForFile });
    }
    // -v-v- SAVE THE FINAL ANSWER TO DB -v-v-
    p("saving to db...");
    const customRequestRecord = await prisma.customRequest.create({
      data: {
        requesterId: account!.id,
        completionResponse: completionForEachFile,
        mode: ScanningMode.EACH_FILE_OVERALL,
        model: model,
        prompt: prompt,
        files: files,
        bucket: bucket,
      },
    });
    // -v-v- SAVE THE PROMPT TO DB -v-v-
    const promptRecord = await prisma.prompt.create({
      data: {
        ownerId: account!.id,
        prompt: prompt,
      },
    });

    // -v-v- STORE FILES FOR REFERENCE -v-v-
    for (let i = 0; i < files.length; i++) {
      console.log("--- ___ ---");

      await prisma.file.create({
        data: {
          customRequestId: customRequestRecord.id,
          originalName: files[i].originalname,
          bucket: files[i].bucket,
          key: files[i].key,
          hash: files[i].etag,
          ownerId: account?.id,
        },
      });
    }
    // -^-^- STORE FILES FOR REFERENCE -^-^-

    // -v-v- SAVE THE FINAL PROMPT TO DB -v-v-
    if (finalPrompt) {
      // -v-v- SAVE THE PROMPT TO DB -v-v-
      await prisma.prompt.create({
        data: {
          ownerId: account!.id,
          prompt: finalPrompt,
        },
      });
    }
    // -v-v- SEND AN EMAIL NOTIFICATION -v-v-
    p("send an email notification...");
    job.progress(95);
    try {
      const emailConfig = customRequestJobComplete_SES_Config(
        email,
        `${process.env.FRONTEND_HOSTNAME}/dashboard/custom-request-result?custom-request-id=${customRequestRecord.id}`,
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
    done(null, { customRequestId: customRequestRecord.id });
  } catch (e) {
    p("ERROR", (e as Error).toString());
    done(e as Error, null);
  }
}
