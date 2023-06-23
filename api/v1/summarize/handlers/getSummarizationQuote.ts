import { Request, Response, NextFunction } from "express";
import { Readable } from "stream";
import { s3Client, s3, GetObjectCommand } from "@/clients/s3_client";
import { get_encoding, encoding_for_model } from "@dqbd/tiktoken";
import * as fs from "fs";
import path from "path";
const enc = encoding_for_model("gpt-3.5-turbo");

async function streamToString(stream: Readable): Promise<string> {
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
}

export async function getSummarizationQuote(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST /get-summarization-quote");

    console.log("req.files", (req.files as any)[0].key);

    // const params = {
    //   Bucket: "kalygo-documents",
    //   Key: (req.files as any)[0].key,
    // };

    const streamToString = (stream: any) =>
      new Promise((resolve, reject) => {
        const chunks: any[] = [];
        stream.on("data", (chunk: any) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      });

    const command = new GetObjectCommand({
      Bucket: "kalygo-documents",
      Key: (req.files as any)[0].key,
    });

    const { Body } = await s3.send(command);
    const text = (await streamToString(Body)) as string;
    const tokenCount = enc.encode(text).length;

    const apiCost = (tokenCount / 1000) * 0.002; // gpt-3.5-turbo cost
    const markup = 1.4; // 40%

    const quote = Number.parseFloat(
      (apiCost * markup > 0.5 ? apiCost * markup : 0.5).toFixed(2)
    );

    res.status(200).json({
      quote: quote.toFixed(2),
      filePath: (req.files as any)[0].key,
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
