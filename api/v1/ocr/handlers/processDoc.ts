const { DocumentProcessorServiceClient } =
  require("@google-cloud/documentai").v1;
import { Request, Response, NextFunction } from "express";
import { jobQueue } from "@/clients/bull_client";
import { QueueJobTypes } from "@/types/JobTypes";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/clients/s3_client";
import { streamToString } from "@/utils/streamToString";

const client = new DocumentProcessorServiceClient({});

export async function processDoc(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST processDoc");
    console.log("req.file", req.file);
    console.log("req.body", req.body);

    const projectId = process.env.GOOGLE_CLOUD_DOCUMENT_AI_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_DOCUMENT_AI_LOCATION;
    const processorId = process.env.GOOGLE_CLOUD_DOCUMENT_AI_PROCESSOR_ID;

    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    // @ts-ignore
    const fileKey = req.file.key;
    // @ts-ignore
    const bucket = req.file.bucket;
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: fileKey,
    });
    const { Body } = await s3.send(command);
    const str = await Body?.transformToByteArray();

    // FOR DEBUGGING -> local files
    // const fs = require("fs").promises;
    // const localFile = await fs.readFile(
    //   `/Users/a/src/actual_projects/api_kalygo2/robert_parada.pdf`
    // );

    const request = {
      name: name,
      rawDocument: {
        content: str,
        // content: localFile,
        mimeType: "application/pdf",
      },
    };

    // Recognizes text entities in the PDF document
    const [result] = await client.processDocument(request);
    const { document } = result;

    // Get all of the document text as one big string
    const { text } = document;

    // FOR DEBUGGING -> helper function that extracts shards from the text field...
    // const getText = (textAnchor: any) => {
    //   if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
    //     return "";
    //   }
    //   // First shard in document doesn't have startIndex property
    //   const startIndex = textAnchor.textSegments[0].startIndex || 0;
    //   const endIndex = textAnchor.textSegments[0].endIndex;

    //   return text.substring(startIndex, endIndex);
    // };

    // FOR DEBUGGING -> reading the text recognition output from the processor...
    // console.log("The document contains the following paragraphs:");
    // const [page1] = document.pages;
    // const { paragraphs } = page1;
    // for (const paragraph of paragraphs) {
    //   const paragraphText = getText(paragraph.layout.textAnchor);
    //   console.log(`Paragraph text:\n${paragraphText}`);
    // }

    res.status(200).json(text);
  } catch (e) {
    next(e);
  }
}
