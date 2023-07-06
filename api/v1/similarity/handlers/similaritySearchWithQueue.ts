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
