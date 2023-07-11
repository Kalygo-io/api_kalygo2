import { Request, Response, NextFunction } from "express";
import { Readable } from "stream";
import { s3Client, s3, GetObjectCommand } from "@/clients/s3_client";
import { get_encoding, encoding_for_model } from "@dqbd/tiktoken";
import * as fs from "fs";
import path from "path";
import prisma from "@/db/prisma_client";
const enc = encoding_for_model("gpt-3.5-turbo");

const streamToString = (stream: any) =>
  new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on("data", (chunk: any) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });

export async function getSummarizationQuote(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST /get-summarization-quote");
    console.log("req.files", (req.files as any)[0]);

    let quote = 0;
    let files = [];
    for (let i = 0; i < (req.files as any)?.length; i++) {
      console.log("<- i ->", (req.files as any)[i]);

      const command = new GetObjectCommand({
        Bucket: process.env.S3_DOCUMENTS_BUCKET,
        Key: (req.files as any)[i].key,
      });

      const { Body } = await s3.send(command);
      const text = (await streamToString(Body)) as string;
      const tokenCount = enc.encode(text).length;

      const apiCost = (tokenCount / 1000) * 0.002; // gpt-3.5-turbo cost
      const markup = 1.4; // 40%

      quote += Number.parseFloat(
        (apiCost * markup > 0.5 ? apiCost * markup : 0.5).toFixed(2)
      );

      files.push({
        key: (req.files as any)[i].key,
        originalName: (req.files as any)[i].originalname,
      });
    }

    res.status(200).json({
      quote: quote.toFixed(2),
      files: files,
    });
  } catch (e) {
    next(e);
  }
}

// const resp = completion.data?.choices[0]?.message?.content;
// gpt-3.5-turbo $0.002 / 1K tokens
// gpt-3.5-turbo 90,000 TPM
// gpt-3.5-turbo token limit per request is 4096 tokens
// 2171 / 1000 = 2.1 x 0.002 = $0.004?
