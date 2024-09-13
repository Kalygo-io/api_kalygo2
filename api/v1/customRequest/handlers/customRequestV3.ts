import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import pick from "lodash.pick";
import { jobQueue } from "@/clients/bull_client";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";
import { QueueJobTypes } from "@/types/JobTypes";
import { ScanningMode } from "@prisma/client";
import { CustomRequestV3Params } from "@/types/CustomRequestV3Params";
import { v4 } from "uuid";

export async function customRequestV3(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST custom-request-v3");
    console.log("req.body.customPrompt", req.body.customPrompt);
    console.log("req.files", req.files as any);

    let locale: string = req?.i18n?.language?.substring(0, 2) || "en";
    const batchId = req.body.batchId || v4();

    if ((req.files?.length as number) > 10)
      throw new Error("Max 10 files per batch");

    if (req.body.mode === ScanningMode.OVERALL) {
      jobQueue.add(
        {
          jobType: QueueJobTypes.CustomRequestV3,
          params: {
            files: req.files as Express.Multer.File[],
            file: null,
            customizations: {
              prompts: {
                finalPrompt: req.body.finalPrompt,
                overallPrompt: req.body.overallPrompt,
                prompt: req.body.prompt,
              },
              scanMode: req.body.mode,
              model: req.body.model,
              chunkSize: req.body.chunkSize,
            },
            // @ts-ignore
            email: req.user.email,
            locale: locale,
            batchId: batchId,
          } as CustomRequestV3Params,
        },
        {
          timeout: 1000 * 60 * 60, // 1 hour before being marked as timed out
        }
      );
    } else {
      for (let fIndex = 0; fIndex < (req.files?.length as number); fIndex++) {
        jobQueue.add(
          {
            jobType: QueueJobTypes.CustomRequestV3,
            params: {
              files: null,
              file: (req.files as Express.Multer.File[])[fIndex],
              customizations: {
                prompts: {
                  finalPrompt: req.body.finalPrompt,
                  overallPrompt: req.body.overallPrompt,
                  prompt: req.body.prompt,
                },
                scanMode: req.body.mode,
                model: req.body.model,
              },
              // @ts-ignore
              email: req.user.email,
              locale: locale,
              batchId: batchId,
            } as CustomRequestV3Params,
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
