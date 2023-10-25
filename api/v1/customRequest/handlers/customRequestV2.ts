import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import pick from "lodash.pick";
import { jobQueue } from "@/clients/bull_client";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";
import { QueueJobTypes } from "@/types/JobTypes";
import { ScanningMode } from "@prisma/client";
import { CustomRequestV2Params } from "@/types/CustomRequestV2Params";
import { v4 } from "uuid";

export async function customRequestV2(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST custom-request-v2");
    console.log("req.body.customPrompt", req.body.customPrompt);
    console.log("req.files", req.files as any);

    let locale: string = req?.i18n?.language?.substring(0, 2) || "en";
    const batchId = req.body.batchId || v4();

    if (req.body.mode === ScanningMode.OVERALL) {
      jobQueue.add(
        {
          jobType: QueueJobTypes.CustomRequestV2,
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
            },
            // @ts-ignore
            email: req.user.email,
            locale: locale,
            batchId: batchId,
          } as CustomRequestV2Params,
        },
        {
          timeout: 1000 * 60 * 60, // 1 hour before being marked as timed out
        }
      );
    } else {
      for (let fIndex = 0; fIndex < (req.files?.length as number); fIndex++) {
        jobQueue.add(
          {
            jobType: QueueJobTypes.CustomRequestV2,
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
            } as CustomRequestV2Params,
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
