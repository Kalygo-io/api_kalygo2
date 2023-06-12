import { Request, Response, NextFunction } from "express";
import { get_encoding, encoding_for_model } from "@dqbd/tiktoken";
import * as fs from "fs";
import crypto from "crypto";
import { ChromaClient } from "chromadb";
import prisma from "@/db/prisma_client";

const enc = encoding_for_model("text-embedding-ada-002");

import { stripe } from "@/clients/stripe_client";
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
    const result = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    // vvv vvv $0.0004 per 1000 tokens for embeddings with
    // https://platform.openai.com/docs/guides/embeddings/what-are-embeddings
    const text = fs.readFileSync(`${req.file?.path}`, "utf8");
    const tokenCount = enc.encode(text).length;
    const apiCost = (tokenCount / 1000) * 0.0004; // text-embedding-ada-002
    const markup = 1.4; // 40%
    const quote = Number.parseFloat(
      (apiCost * markup > 0.5 ? apiCost * markup : 0.5).toFixed(2)
    );

    await stripe.charges.create({
      amount: quote * 100,
      currency: "usd",
      description: `Vector Search for ${req.file?.path}`,
      customer: result?.stripeId,
    });
    // ^^^ ^^^

    const query = req.body.query;

    console.log("query", query);

    let intResults: any = text.match(/[^\.!\?]+[\.!\?]+/g);

    // console.log("intResults", intResults);

    intResults = intResults?.slice(0, 2048);

    let chunks = intResults?.map((i: string, idx: number) => {
      return i;
    });
    let metadata = intResults?.map((i: string, idx: number) => {
      return {
        index: idx,
      };
    });
    let ids: any = intResults?.map((i: string, idx: number) => {
      return `id${idx}`;
    });

    const shasum = crypto.createHash("sha1");
    shasum.update(text);
    const hashIdOfText = shasum.digest("hex");

    console.log("hashIdOfText", hashIdOfText);

    try {
      await client.deleteCollection({
        name: hashIdOfText,
      });
    } catch (e) {}

    const test_collection = await client.createCollection({
      name: hashIdOfText,
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

    // console.log(results);

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

    // console.log("___ --- ___ --- ___");

    try {
      await client.deleteCollection({
        name: hashIdOfText,
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
