import { Request, Response, NextFunction } from "express";
import { jobQueue } from "@/clients/bull_client";
import { QueueJobTypes } from "@/types/JobTypes";

export async function similaritySearchWithQueue(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST similaritySearchWithQueue");
    console.log(req.body.files);
    console.log(req.file);

    let language: string = req?.i18n?.language?.substring(0, 2) || "en";
    const query = req.body.query;

    jobQueue.add(
      {
        jobType: QueueJobTypes.VectorSearch,
        params: {
          // @ts-ignore
          key: req.file?.key,
          originalName: req.file?.originalname,
          query: query,
          bucket: process.env.S3_DOCUMENTS_BUCKET,
          // @ts-ignore
          email: req.user.email,
          language: language,
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
