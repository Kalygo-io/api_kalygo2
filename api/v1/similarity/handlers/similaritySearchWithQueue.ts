import { Request, Response, NextFunction } from "express";
import { get_encoding, encoding_for_model } from "@dqbd/tiktoken";
import * as fs from "fs";
import crypto from "crypto";
import prisma from "@/db/prisma_client";
import { chromaClient } from "@/clients/chroma_client";

const enc = encoding_for_model("text-embedding-ada-002");

import { jobQueue } from "@/clients/bull_client";
import { OpenAIEmbeddingFunction } from "chromadb";
import { QueueJobTypes } from "@/types/JobTypes";

const embedder = new OpenAIEmbeddingFunction({
  openai_api_key: process.env.OPENAI_API_KEY!,
});

export async function similaritySearchWithQueue(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = req.body.query;

    jobQueue.add(
      {
        jobType: QueueJobTypes.VectorSearch,
        params: {
          query: query,
          bucket: process.env.S3_DOCUMENTS_BUCKET,
          // @ts-ignore
          email: req.user.email,
        },
      },
      {
        timeout: 600000,
      }
    );

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
