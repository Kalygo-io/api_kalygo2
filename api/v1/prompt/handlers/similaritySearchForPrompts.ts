import { Request, Response, NextFunction } from "express";
import prisma from "@db/prisma_client";
import { guard_beforeRunningSearch } from "../../similarity/handlers/helpers/guard_beforeRunningSearch";
import { Tiktoken, encoding_for_model } from "@dqbd/tiktoken";
import { chromaClient } from "@/clients/chroma_client";
import { OpenAIEmbeddingFunction } from "chromadb";

const embedder = new OpenAIEmbeddingFunction({
  openai_api_key: process.env.OPENAI_API_KEY!,
});

export async function similaritySearchForPrompts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { prompt } = req.body;

    console.log("Prompts /prompts/similarity-search", id);

    // @ts-ignore
    const email = req.user.email;

    const model = "text-embedding-ada-002";
    // -v-v- CHECK IF CALLER HAS AN ACCOUNT -v-v-
    const account = await guard_beforeRunningSearch(email, model);
    // -v-v- !!! -v-v-
    const results = await prisma.prompt.findMany({
      where: {
        ownerId: account?.id,
        prompt: {
          search: req.body.query,
        },
      },
    });
    // -v-v- TRACK I/O TOKENS FOR BILLING -v-v-
    const encoder: Tiktoken = encoding_for_model(model);
    let inputTokens = 0;
    let outputTokens = 0;

    let intResults: {
      prompt: string;
      ownerId: number;
      id: number;
    }[] = [];

    console.log("results", results);

    for (let i = 0; i < results.length; i++) {
      if (prompt !== results[i].prompt) {
        intResults.push({
          prompt: results[i].prompt,
          ownerId: results[i].ownerId,
          id: results[i].id,
        });
      }
    }

    intResults = intResults?.slice(0, 2048);

    let chunks = intResults?.map(
      (
        i: {
          prompt: string;
          ownerId: number;
        },
        idx: number
      ) => {
        return i.prompt;
      }
    );

    let metadata = intResults?.map(
      (
        i: {
          prompt: string;
          ownerId: number;
          id: number;
        },
        idx: number
      ) => {
        return {
          index: idx,
          ownerId: i.ownerId,
          id: i.id,
        };
      }
    );

    let ids: any = intResults?.map((i: any, idx: number) => {
      return `id${idx}`;
    });

    // const shasum = crypto.createHash("sha1");
    // shasum.update(textConcat);
    // const hashIdOfText = shasum.digest("hex");
    // console.log("hashIdOfText", hashIdOfText);
    const nameOfVectorDbCollection = `prompt_for_${account?.id}`;
    try {
      await chromaClient.deleteCollection({
        name: nameOfVectorDbCollection,
      });
    } catch (e) {}
    const test_collection = await chromaClient.createCollection({
      name: nameOfVectorDbCollection,
      embeddingFunction: embedder,
    });
    await test_collection.add({
      ids: ids,
      metadatas: metadata,
      documents: chunks,
    });
    const similaritySearchResults = await test_collection.query({
      nResults: 10,
      queryTexts: [prompt],
    });
    try {
      await chromaClient.deleteCollection({
        name: nameOfVectorDbCollection,
      });
    } catch (e) {}

    const similarPrompts = similaritySearchResults.metadatas[0].map(
      (val: any) => {
        console.log("val", val);
        return val.id;
      }
    );

    const finalResults = await prisma.prompt.findMany({
      where: {
        id: {
          in: similarPrompts,
        },
      },
    });

    res.status(200).json(finalResults);
  } catch (e) {
    next(e);
  }
}
