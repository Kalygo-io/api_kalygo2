import { Request, Response, NextFunction } from "express";

// import prisma from "@db/prisma_client";

import { OpenAI } from "langchain/llms/openai";
import { loadSummarizationChain } from "langchain/chains";
import {
  RecursiveCharacterTextSplitter,
  CharacterTextSplitter,
} from "langchain/text_splitter";
import * as fs from "fs";

export async function summarize(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const text = fs.readFileSync(`${req.file?.path}`, "utf8");

    const model = new OpenAI({
      temperature: 0,
      modelName: "text-davinci-002",
    });

    const textSplitter = new CharacterTextSplitter({
      chunkSize: 1000,
    });

    // const textSplitter = new RecursiveCharacterTextSplitter({
    //   separators: ["\n\n", "\n"],
    // });

    const docs = await textSplitter.createDocuments([text]);

    const chain = loadSummarizationChain(model, { type: "map_reduce" });
    const resp = await chain.call({
      input_documents: docs,
    });

    res.status(200).json({
      summary: resp,
    });
  } catch (e) {
    next(e);
  }
}
