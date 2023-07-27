import { Request, Response, NextFunction } from "express";
import { get_encoding, encoding_for_model } from "@dqbd/tiktoken";
import * as fs from "fs";
import crypto from "crypto";
import prisma from "@/db/prisma_client";
import { chromaClient } from "@/clients/chroma_client";

const enc = encoding_for_model("text-embedding-ada-002");

import { stripe } from "@/clients/stripe_client";
import { OpenAIEmbeddingFunction } from "chromadb";
import { convertPDFToTxtWithMetadata } from "@/jobHandlers/helpers/customRequestJob/pdf_2_txt_with_metadata";

const embedder = new OpenAIEmbeddingFunction({
  openai_api_key: process.env.OPENAI_API_KEY!,
});

export async function similaritySearch(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
      include: {
        VectorSearchCredits: true,
      },
    });

    // vvv vvv $0.0004 per 1000 tokens for embeddings with
    // https://platform.openai.com/docs/guides/embeddings/what-are-embeddings

    let textWithMetadata;
    let textConcat;
    if (req.file?.mimetype === "application/pdf") {
      const rawPDFData = fs.readFileSync(`${req.file?.path}`);
      textWithMetadata = await convertPDFToTxtWithMetadata(
        new Uint16Array(rawPDFData)
      );
      textConcat = textWithMetadata.reduce(
        (accum: string, val: Record<string, any>) => {
          return accum + val.text;
        },
        ""
      );
    } else {
      const rawTextData = fs.readFileSync(`${req.file?.path}`, "utf8");
      textWithMetadata = [
        {
          text: rawTextData,
          page: 0,
        },
      ];
      textConcat = rawTextData;
    }

    const tokenCount: number = enc.encode(textConcat).length;
    const apiCost = (tokenCount / 1000) * 0.0004; // text-embedding-ada-002
    const markup = 1.4; // 40%
    const quote = Number.parseFloat(
      (apiCost * markup > 0.5 ? apiCost * markup : 0.5).toFixed(2)
    );

    const vectorSearchCredits = account?.VectorSearchCredits?.amount;
    if (vectorSearchCredits && vectorSearchCredits > 0) {
      await prisma.vectorSearchCredits.updateMany({
        where: {
          accountId: account.id,
        },
        data: {
          amount: vectorSearchCredits - 1,
        },
      });
    } else {
      await stripe.charges.create({
        amount: quote * 100,
        currency: "usd",
        description: `Vector Search for ${req.file?.path}`,
        customer: account?.stripeId,
      });
    }
    // ^^^ ^^^

    const query = req.body.query;
    console.log("--- query ---", query);

    // let intResults: any = text.match(/[^\.!\?]+[\.!\?]+/g);
    // let intResults: any = textConcat.split(/[ ,]+/);

    let intResults: {
      textChunk: string;
      page: number;
    }[] = [];

    for (let i = 0; i < textWithMetadata.length; i++) {
      let pageChunks: any[] = textWithMetadata[i].text.split(/[ ,]+/);

      for (let j = 0; j < pageChunks.length; j++) {
        intResults.push({
          textChunk: pageChunks[j],
          page: textWithMetadata[i].page,
        });
      }
    }

    intResults = intResults?.slice(0, 2048);
    let chunks = intResults?.map(
      (
        i: {
          textChunk: string;
          page: number;
        },
        idx: number
      ) => {
        return i.textChunk;
      }
    );
    let metadata = intResults?.map(
      (
        i: {
          textChunk: string;
          page: number;
        },
        idx: number
      ) => {
        return {
          index: idx,
          pageNumber: i.page,
        };
      }
    );
    let ids: any = intResults?.map(
      (
        i: {
          textChunk: string;
          page: number;
        },
        idx: number
      ) => {
        return `id${idx}`;
      }
    );

    const shasum = crypto.createHash("sha1");
    shasum.update(textConcat);
    const hashIdOfText = shasum.digest("hex");

    console.log("hashIdOfText", hashIdOfText);

    try {
      await chromaClient.deleteCollection({
        name: hashIdOfText,
      });
    } catch (e) {}

    const test_collection = await chromaClient.createCollection({
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

    try {
      await chromaClient.deleteCollection({
        name: hashIdOfText,
      });
    } catch (e) {}

    try {
      fs.unlink(`${req.file?.path}`, () => {});
    } catch (e) {}

    res.status(200).json({
      results: results,
    });
  } catch (e) {
    next(e);
  }
}
