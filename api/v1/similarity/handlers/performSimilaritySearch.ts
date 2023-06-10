import { Request, Response, NextFunction } from "express";
import * as fs from "fs";

import { ChromaClient } from "chromadb";

import { OpenAIEmbeddingFunction } from "chromadb";
const embedder = new OpenAIEmbeddingFunction({
  openai_api_key: process.env.OPENAI_API_KEY!,
});

const client = new ChromaClient();

export async function performSimilaritySearch(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = req.body.query;

    console.log("query", query);

    const text = fs.readFileSync(`${req.file?.path}`, "utf8");

    // const splitter = new RecursiveCharacterTextSplitter({
    //   separators: ["\n\n", "\n", "."],
    // });
    // const output = await splitter.createDocuments([text]);

    // const re = RegExp("(?<!w.w.)(?<![A-Z][a-z].)(?<=.|?)s");
    // const matches = text.match(re);
    // console.log("matches", matches);

    let intResults = text.match(/[^\.!\?]+[\.!\?]+/g);

    console.log("intResults", intResults);

    let chunks = intResults?.map((i, idx) => {
      //   console.log("i", i.pageContent);

      return i;
    });

    let metadata = intResults?.map((i, idx) => {
      return {
        index: idx,
      };
    });

    let ids: any = intResults?.map((i, idx) => {
      //   console.log("i", i.metadata);

      return `id${idx}`;
    });

    try {
      await client.deleteCollection({
        name: "test_collection",
      });
    } catch (e) {}

    const test_collection = await client.createCollection({
      name: "test_collection",
      embeddingFunction: embedder,
    });

    await test_collection.add({
      ids: ids,
      metadatas: metadata,
      documents: chunks,
    });

    const results = await test_collection.query({
      nResults: 10,
      queryTexts: [query],
    });

    console.log(results);

    // const vectorStore = await HNSWLib.fromTexts(
    //   chunks,
    //   metadata,
    //   new OpenAIEmbeddings()
    // );

    // const vectorStore = await FaissStore.fromTexts(
    //   chunks,
    //   metadata,
    //   new OpenAIEmbeddings()
    // );

    // const results = await vectorStore.similaritySearchWithScore(query);

    console.log("___ --- ___ --- ___");

    try {
      await client.deleteCollection({
        name: "test_collection",
      });
    } catch (e) {}

    // console.log(results);
    // res.status(200).send();

    res.status(200).json({
      results: results,
    });
  } catch (e) {
    next(e);
  }
}
