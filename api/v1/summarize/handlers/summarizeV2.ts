import { Request, Response, NextFunction } from "express";
import { jobQueue } from "@/clients/bull_client";
import { QueueJobTypes } from "@/types/JobTypes";
import { ScanningMode } from "@prisma/client";

import { v4 } from "uuid";

export async function summarizeV2(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST summarizeV2");
    console.log("req.files", req.files);
    console.log("req.body", req.body);

    let locale: string = req?.i18n?.language?.substring(0, 2) || "en";

    if (req.body.mode === ScanningMode.FILE_OVERALL) {
      for (let fIndex = 0; fIndex < (req.files?.length as number); fIndex++) {
        jobQueue.add(
          {
            jobType: QueueJobTypes.SummaryV2,
            params: {
              bucket: process.env.S3_DOCUMENTS_BUCKET,
              files: [(req.files as any)[fIndex]],
              customizations: {
                format: req.body.format,
                mode: req.body.mode,
                length: req.body.length,
                language: req.body.language,
                model: req.body.model,
              },
              // @ts-ignore
              email: req.user.email,
              locale,
            },
          },
          {
            timeout: 1000 * 60 * 60, // 1 hour before being marked as timed out
          }
        );
      }
    } else {
      jobQueue.add(
        {
          jobType: QueueJobTypes.SummaryV2,
          params: {
            bucket: process.env.S3_DOCUMENTS_BUCKET,
            files: req.files,
            customizations: {
              format: req.body.format,
              mode: req.body.mode,
              length: req.body.length,
              language: req.body.language,
              model: req.body.model,
            },
            // @ts-ignore
            email: req.user.email,
            locale,
          },
        },
        {
          timeout: 1000 * 60 * 60, // 1 hour before being marked as timed out
        }
      );
    }
    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
