import { Request, Response, NextFunction } from "express";
import { jobQueue } from "@/clients/bull_client";
import { QueueJobTypes } from "@/types/JobTypes";
import { v4 } from "uuid";
import { SummaryV3Params } from "@/types/SummaryV3Params";
import { ScanningMode } from "@prisma/client";

export async function summarizeV3(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST summarizeV3");
    console.log("req.files", req.files);
    console.log("req.body", req.body);

    let locale: string = req?.i18n?.language?.substring(0, 2) || "en";
    const batchId = req.body.batchId || v4();

    if ((req.files?.length as number) > 10)
      throw new Error("Max 10 files per batch");

    if (req.body.mode === ScanningMode.OVERALL) {
      jobQueue.add(
        {
          jobType: QueueJobTypes.SummaryV3,
          params: {
            batchId,
            files: req.files as any,
            customizations: {
              format: req.body.format,
              scanMode: req.body.mode,
              length: req.body.length,
              language: req.body.language,
              model: req.body.model,
              chunkTokenOverlap:
                Number.parseInt(req.body.chunkTokenOverlap) || 0,
            },
            // @ts-ignore
            email: req.user.email,
            locale,
          } as SummaryV3Params,
        },
        {
          timeout: 1000 * 60 * 60, // 1 hour before being marked as timed out
        }
      );
    } else {
      for (let fIndex = 0; fIndex < (req.files?.length as number); fIndex++) {
        jobQueue.add(
          {
            jobType: QueueJobTypes.SummaryV3,
            params: {
              batchId,
              file: (req.files as any)[fIndex],
              customizations: {
                format: req.body.format,
                scanMode: req.body.mode,
                length: req.body.length,
                language: req.body.language,
                model: req.body.model,
                chunkTokenOverlap:
                  Number.parseInt(req.body.chunkTokenOverlap) || 0,
              },
              // @ts-ignore
              email: req.user.email,
              locale,
            } as SummaryV3Params,
          },
          {
            timeout: 1000 * 60 * 60, // 1 hour before being marked as timed out
          }
        );
      }
    }

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
