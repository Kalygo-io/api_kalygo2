import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import pick from "lodash.pick";
import { jobQueue } from "@/clients/bull_client";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";
import { QueueJobTypes } from "@/types/JobTypes";

export async function customRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST custom-request");
    console.log("req.body.customPrompt", req.body.customPrompt);
    console.log("req.files", req.files as any);

    let language: string = req?.i18n?.language?.substring(0, 2) || "en";

    jobQueue.add(
      {
        jobType: QueueJobTypes.CustomRequest,
        params: {
          bucket: process.env.S3_DOCUMENTS_BUCKET,
          files: req.files,
          customizations: {
            finalPrompt: req.body.finalPrompt,
            mode: req.body.mode,
            model: req.body.model,
            overallPrompt: req.body.overallPrompt,
            prompt: req.body.prompt,
          },
          // @ts-ignore
          email: req.user.email,
          language: language,
          model: req.body.model,
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
