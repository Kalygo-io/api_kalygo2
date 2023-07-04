import { encoding_for_model } from "@dqbd/tiktoken";
import crypto from "crypto";
import prisma from "@/db/prisma_client";
import { chromaClient } from "@/clients/chroma_client";
import { streamToString } from "@/utils/streamToString";
import { s3, GetObjectCommand } from "@/clients/s3_client";
import { vectorSearchJobComplete_SES_Config } from "@/emails/vectorSearchJobComplete";
import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { stripe } from "@/clients/stripe_client";
import { sesClient } from "@/clients/ses_client";
import { OpenAIEmbeddingFunction } from "chromadb";

const enc = encoding_for_model("text-embedding-ada-002");

const embedder = new OpenAIEmbeddingFunction({
  openai_api_key: process.env.OPENAI_API_KEY!,
});

export async function vectorSearchJobLogic(
  params: {
    query: string;
    bucket: string;
    key: string;
    language: string;
    email: string;
    originalName: string;
  },
  job: any,
  done: (err?: Error | null, result?: any) => void
) {
  try {
    console.log("processing JOB with params.*!.*!.", params);
    const { query, bucket, key, email, originalName } = params;
    console.log(query, bucket, key, email, originalName);
    if (!query || !bucket || !key || !email || !originalName) {
      console.log("Invalid Data?");

      done(new Error("Invalid Data"));
      return;
    }

    console.log("fetch account");

    const account = await prisma.account.findFirst({
      where: {
        email: email,
      },
    });

    console.log("account", account);

    // vvv vvv $0.0004 per 1000 tokens for embeddings with
    // https://platform.openai.com/docs/guides/embeddings/what-are-embeddings
    // const text = fs.readFileSync(`${req.file?.path}`, "utf8");
    // download file from S3
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const { Body } = await s3.send(command);
    const text = (await streamToString(Body)) as string;

    console.log("text", text);

    const tokenCount = enc.encode(text).length;
    const apiCost = (tokenCount / 1000) * 0.0004; // text-embedding-ada-002
    const markup = 1.4; // 40%
    const quote = Number.parseFloat(
      (apiCost * markup > 0.5 ? apiCost * markup : 0.5).toFixed(2)
    );

    await stripe.charges.create({
      amount: quote * 100,
      currency: "usd",
      description: `Vector Search for ${bucket}/${key}`,
      customer: account?.stripeId,
    });
    // ^^^ ^^^

    // let intResults: any = text.match(/[^\.!\?]+[\.!\?]+/g);
    let intResults: any = text.split(/[ ,]+/);
    // console.log("intResults", intResults);
    intResults = intResults?.slice(0, 2048);

    let chunks = intResults?.map((i: string, idx: number) => {
      return i;
    });
    let metadata = intResults?.map((i: string, idx: number) => {
      return {
        index: idx,
        chunkNumber: idx,
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

    const vectorSearchRecord = await prisma.vectorSearch.create({
      data: {
        requesterId: account!.id,
        filename: originalName,
        bucket: bucket,
        bucketKey: key,
        query: query,
        results: results,
      },
    });

    console.log("about to send an email...");

    // Send an email
    job.progress(50);

    try {
      const emailConfig = vectorSearchJobComplete_SES_Config(
        email,
        `${process.env.FRONTEND_HOSTNAME}/dashboard/vector-search-result?vector-search-id=${vectorSearchRecord.id}` // TODO
      );
      await sesClient.send(new SendTemplatedEmailCommand(emailConfig));
    } catch (e) {}

    job.progress(99);

    done(null, {
      vectorSearchId: vectorSearchRecord.id,
    });

    job.progress(100);
  } catch (e: any) {
    done(new Error(e ? e.message : "Something went wrong"));
  }
}
