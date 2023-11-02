import { Request, Response, NextFunction } from "express";
import { encoding_for_model, Tiktoken } from "@dqbd/tiktoken";

import { convertPDFToTextWithMetadata } from "@utils/convertPDFToTextWithMetadata";
import { p } from "@/utils/p";
import { s3, GetObjectCommand } from "@/clients/s3_client";
import { streamToString } from "@/utils/streamToString";
import fs from "fs";
import { getEncoderForModel } from "./shared/getEncoderForModel";
import { convertFileOnDiskToTextFormat } from "@/utils/convertFileOnDiskToTextFormat";
import { generatePromptPrefix } from "./helpers/generatePromptPrefix";
import { areChunksWithPromptPrefixValidForModelContext } from "@/utils/areChunksWithPromptPrefixValidForModelContext";
import CONFIG from "@/config";
import { makeChunksFitContext } from "./helpers/makeChunksFitContext";
import { sleep } from "@/utils/sleep";
import { generateOpenAiUserChatCompletionWithExponentialBackoff } from "./shared/generateOpenAiUserChatCompletionWithExponentialBackoff";
import { OpenAI } from "@/clients/openai_client";

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
    const promptPrefix = `${req.body.prompt}`;
    // prettier-ignore
    let summaryForFile: { file: string, summary: { chunk: number; chunkSummary: string }[] };
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
      p(`calling OpenAI to summarize chunk ${i} of file...`);

      let completion;

      completion = await generateOpenAiUserChatCompletionWithExponentialBackoff(
        model,
        prompt,
        tpmDelay,
        OpenAI
      );

      const completionText: string =
        completion.data?.choices[0]?.message?.content || "ERROR: No Content";
      p(`snippet of last OpenAI completion - '${completionText.slice(0, 16)}'`);
      const outputTokenCount = encoder.encode(completionText).length;

      outputTokens += outputTokenCount; // track output tokens
      tpmAccum += outputTokenCount; // accumulate total tokens
      summarizedChunksOfFile.push({ chunk: i, chunkSummary: completionText });
      //   p("i", i, "chunks.length", chunks.length);
    }

    // --- --- ---

    const prompt = req.body.prompt;
    console.log("--- prompt ---", prompt);
    p(fileToText.slice(0, 32));
    res.status(200).json({
      completion: "543-243-2035",
    });
  } catch (e) {
    next(e);
  }
}
