import { Request, Response, NextFunction } from "express";
import { encoding_for_model, Tiktoken } from "@dqbd/tiktoken";
import crypto from "crypto";
import prisma from "@/db/prisma_client";
import { chromaClient } from "@/clients/chroma_client";
import config from "@/config";

const enc = encoding_for_model("text-embedding-ada-002");

import { stripe } from "@/clients/stripe_client";
import { OpenAIEmbeddingFunction } from "chromadb";
import { convertPDFToTxtWithMetadata } from "@/jobHandlers/helpers/customRequestJob/pdf_2_txt_with_metadata";
import { guard_beforeRunningSearch } from "./helpers/guard_beforeRunningSearch";
import { p } from "@/utils/p";
import { s3, GetObjectCommand } from "@/clients/s3_client";
import { streamToString } from "@/utils/streamToString";

const embedder = new OpenAIEmbeddingFunction({
  openai_api_key: process.env.OPENAI_API_KEY!,
});

export async function similaritySearch(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("(req.files as any)[0]", req.file as any);
    // v-v-v args v-v-v
    const model = "text-embedding-ada-002";
    // @ts-ignore
    const email = req.user.email;
    const file = req.file;
    // @ts-ignore
    const bucket = req.file.bucket;
    // -v-v- CHECK IF CALLER HAS AN ACCOUNT -v-v-
    const account = await guard_beforeRunningSearch(email, model);
    // -v-v- TRACK I/O TOKENS FOR BILLING -v-v-
    const encoder: Tiktoken = encoding_for_model(model);
    let inputTokens = 0;
    let outputTokens = 0;
    let textWithMetadata;
    let textConcat;
    if (req.file?.mimetype === "application/pdf") {
      // TODO - refactor
      const command = new GetObjectCommand({
        Bucket: bucket,
        // @ts-ignore
        Key: file.key,
      });
      const { Body } = await s3.send(command);
      let text;
      // @ts-ignore
      let pdfByteArray = await Body?.transformToByteArray();
      textWithMetadata = await convertPDFToTxtWithMetadata(pdfByteArray);
      textConcat = textWithMetadata.reduce(
        (accum: string, val: Record<string, any>) => {
          return accum + val.text;
        },
        ""
      );
    } else {
      // -v-v- IF TEXT, THEN SIMPLY DOWNLOAD IT -v-v-
      const command = new GetObjectCommand({
        Bucket: bucket,
        // @ts-ignore
        Key: file.key,
      });
      const { Body } = await s3.send(command);
      let text;
      // @ts-ignore

      text = (await streamToString(Body)) as string;
      textWithMetadata = [
        {
          text,
          page: 0,
        },
      ];
      textConcat = text;
    }

    const tokenCount: number = enc.encode(textConcat).length;
    const apiCost =
      (tokenCount / config.models[model].pricing.usage.perTokens) *
      config.models[model].pricing.usage.rate; // text-embedding-ada-002
    const markup = config.models[model].pricing.markUp; // 40%
    const quote = Number.parseFloat(
      (apiCost * markup > 0.5 ? apiCost * markup : 0.5).toFixed(2) // Stripe minimum charge is 50¢
    );
    const vectorSearchCredits = account?.VectorSearchCredits?.amount;
    if (account && vectorSearchCredits && vectorSearchCredits > 0) {
      await prisma.vectorSearchCredits.updateMany({
        where: {
          accountId: account.id,
        },
        data: {
          amount: vectorSearchCredits - 1,
        },
      });
    } else {
      // TODO - refactor
      // FIND EXISTING STRIPE CUSTOMER
      const customerSearchResults = await stripe.customers.search({
        // @ts-ignore
        query: `email:\'${req.user.email}\'`,
      });
      await stripe.charges.create({
        amount: quote * 100,
        currency: "usd",
        description: `Vector Search for ${req.file?.path}`,
        customer: customerSearchResults.data[0].id,
      });
    }
    const query = req.body.query;
    console.log("--- query ---", query);
    // let intResults: any = text.match(/[^\.!\?]+[\.!\?]+/g);
    // let intResults: any = textConcat.split(/[ ,]+/);
    // vvv vvv vvv vvv
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

    res.status(200).json({
      results: results,
    });
  } catch (e) {
    next(e);
  }
}
