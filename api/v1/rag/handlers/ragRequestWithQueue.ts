import { jobQueue } from "@/clients/bull_client";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";
import { QueueJobTypes } from "@/types/JobTypes";

export async function ragRequestWithQueue(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST rag-request-with-queue");
    console.log("req.query", req.body.prompt);
    console.log("req.file", req.file as any);

    let locale: string = req?.i18n?.language?.substring(0, 2) || "en";

    jobQueue.add(
      {
        jobType: QueueJobTypes.RagRequest,
        params: {
          bucket: process.env.S3_DOCUMENTS_BUCKET,
          file: req.file,
          customizations: {
            model: req.body.model,
            prompt: req.body.prompt,
          },
          // @ts-ignore
          email: req.user.email,
          locale: locale,
        },
      },
      {
        timeout: 1000 * 60 * 60, // 1 hour before being marked as timed out
      }
    );

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
