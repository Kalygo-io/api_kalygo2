import { Request, Response, NextFunction } from "express";
import { p } from "@/utils/p";
import { getEncoderForModel } from "./shared/getEncoderForModel";
import { convertFileOnDiskToTextFormat } from "@/utils/convertFileOnDiskToTextFormat";
import { areChunksWithPromptPrefixValidForModelContext } from "@/utils/areChunksWithPromptPrefixValidForModelContext";
import CONFIG from "@/config";
import { makeChunksFitContext } from "./helpers/makeChunksFitContext";
import { sleep } from "@/utils/sleep";
import { generateOpenAiUserChatCompletionWithExponentialBackoff } from "./shared/generateOpenAiUserChatCompletionWithExponentialBackoff";
import { OpenAI } from "@/clients/openai_client";
import { ScanningMode } from "@prisma/client";
import fs from "fs";
import { isChunkValidForModelContext } from "@/utils/isChunkValidForModelContext";
import { breakUpNextChunkForOverallPrompt } from "./helpers/breakUpNextChunkForOverallPrompt";

const tpmDelay = 60000;

export async function promptAgainstData(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("req.files", (req.files as any)[0]);
    let chunks: string[] = [];
    const model = "gpt-3.5-turbo";
    const chunkTokenOverlap = 0;
    const encoder = getEncoderForModel(model);
    const fileToText: string = await convertFileOnDiskToTextFormat(
      (req.files as any)[0].path
    );
    const promptPrefix = `PROMPT:\n${req.body.prompt}\n\nCONTEXT:\n`;
    // prettier-ignore
    let tpmAccum: number = 0;
    let inputTokens = 0,
      outputTokens = 0;
    // BREAK TEXT INTO CHUNKS SO
    // PROMPT_PREFIX + THE CHUNK IS WITHIN TOKEN LIMIT
    chunks = [fileToText];

    // --- --- ---

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
    let processedChunksOfFile: {
      chunk: number;
      chunkCompletion: string;
    }[] = [];

    let completionPromises = [];

    for (let i = 0; i < chunks.length; i++) {
      const prompt = `${promptPrefix} ${chunks[i]}`;
      // const promptTokenCount = encoder.encode(prompt).length;
      // inputTokens += promptTokenCount;
      // tpmAccum += promptTokenCount;
      // p("total inputTokens", inputTokens, "total outputTokens", outputTokens);
      // p("tpmAccum", tpmAccum);
      // if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) {
      //   p(`sleeping for ${tpmDelay / 60000} minute(s)`);
      //   // await sleep(tpmDelay); // pause for model TPM LIMIT
      //   tpmAccum = 0;
      // }
      p(`calling OpenAI to process chunk ${i} of file...`);

      completionPromises.push(
        generateOpenAiUserChatCompletionWithExponentialBackoff(
          model,
          prompt,
          tpmDelay,
          OpenAI
        )
      );

      // let completion;
      // completion = await generateOpenAiUserChatCompletionWithExponentialBackoff(
      //   model,
      //   prompt,
      //   tpmDelay,
      //   OpenAI
      // );
      // const completionText: string =
      //   completion.data?.choices[0]?.message?.content || "ERROR: No Content";
      // p(`snippet of last OpenAI completion - '${completionText.slice(0, 16)}'`);
      // const outputTokenCount = encoder.encode(completionText).length;
      // outputTokens += outputTokenCount;
      // tpmAccum += outputTokenCount;
      // processedChunksOfFile.push({ chunk: i, chunkCompletion: completionText });
    }

    const allPromises = Promise.all(completionPromises);
    try {
      const values = await allPromises;
      // console.log(values);

      for (let i = 0; i < values.length; i++) {
        const completionText: string =
          values[i].data?.choices[0]?.message?.content || "ERROR: No Content";
        processedChunksOfFile.push({
          chunk: i,
          chunkCompletion: completionText,
        });
      }
    } catch (error) {
      console.log(error);
    }

    // -v-v- -v-v- OVERALL PROMPT -v-v- -v-v-

    // const completionsOfEachFileConcatenated: string = processedChunksOfFile
    //   .map((i) => {
    //     return `${i.chunkCompletion}`;
    //   })
    //   .join("\n\n");
    // let chunksRound2 = [completionsOfEachFileConcatenated];
    // let overallOutputs: {
    //   chunk: number;
    //   chunkCompletion: string;
    // }[] = [];
    // let overallPartCounter = 0;
    // while (chunksRound2.length > 0) {
    //   p("outer while...");
    //   let finalPrompt = `${promptPrefix} ${chunksRound2[0]}`;

    //   debugger;

    //   while (
    //     !isChunkValidForModelContext(
    //       finalPrompt,
    //       CONFIG.models[model].context,
    //       encoder
    //     )
    //   ) {
    //     breakUpNextChunkForOverallPrompt(chunksRound2, processedChunksOfFile); // TODO: handle case when OVERALL prompt outputs exceeds context
    //   }

    //   p("WE HAVE NOW BIT OFF AN ACCEPTABLE CHUNK");

    //   finalPrompt = `${promptPrefix} ${chunksRound2[0]}`;

    //   p("*** snippet of finalPrompt... ***", finalPrompt.slice(0, 16));
    //   const finalPromptTokenCount = encoder.encode(finalPrompt).length;
    //   p("tokens to be sent", finalPromptTokenCount);
    //   inputTokens += encoder.encode(finalPrompt).length;
    //   tpmAccum += encoder.encode(finalPrompt).length;
    //   if (tpmAccum > CONFIG.models[model].tpm - CONFIG.tpmBuffer) {
    //     p(`sleeping for ${tpmDelay / 60000} minute(s)`);
    //     // await sleep(tpmDelay);
    //     tpmAccum = 0;
    //   }

    //   debugger;

    //   let completion =
    //     await generateOpenAiUserChatCompletionWithExponentialBackoff(
    //       model,
    //       finalPrompt,
    //       tpmDelay
    //     );
    //   const completionText =
    //     completion.data?.choices[0]?.message?.content || "No Content";
    //   const outputTokenCount = encoder.encode(completionText).length;

    //   outputTokens += outputTokenCount; // track output tokens
    //   tpmAccum += outputTokenCount; // accumulate output tokens
    //   // prettier-ignore
    //   p("snippet of completion of FINAL request...", completionText.slice(0, 16));
    //   // prettier-ignore
    //   overallOutputs.push({ chunk: overallPartCounter, chunkCompletion: completionText });
    //   chunksRound2.shift();
    //   overallPartCounter++;
    // }

    console.log("---");

    // -v-v- -v-v- ALT. OVERALL PROMPT -v-v- -v-v-
    const completionsOfEachFileConcatenated: string = processedChunksOfFile
      .map((i) => {
        return `${i.chunkCompletion}`;
      })
      .join("\n\n");

    let finalPrompt = `Here is the result of applying the PROMPT to each chunk of a larger batch of data\n\n`;
    for (let i = 0; i < processedChunksOfFile.length; i++) {
      finalPrompt += `Chunk ${processedChunksOfFile[i].chunk}\n${processedChunksOfFile[i].chunkCompletion}`;
    }

    finalPrompt += `Take the above into consideration when providing the answer to the following PROMPT\n\n${req.body.prompt}`;

    let completion =
      await generateOpenAiUserChatCompletionWithExponentialBackoff(
        model,
        finalPrompt,
        tpmDelay
      );
    const finalCompletionText =
      completion.data?.choices[0]?.message?.content || "No Content";

    // -^-^- -^-^- -^-^- -^-^-

    p(fileToText.slice(0, 32));
    res.status(200).json({
      scanMode: ScanningMode.FILE_IN_CHUNKS,
      // completions: processedChunksOfFile,
      completions: [
        {
          chunk: 0,
          chunkCompletion: finalCompletionText,
        },
      ],
      // completions: overallOutputs,
    });
  } catch (e) {
    next(e);
  }
}
