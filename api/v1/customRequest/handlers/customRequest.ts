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

    console.log("req.body.prompt", req.body.prompt);
    console.log("req.files", req.files as any);

    jobQueue.add(
      {
        jobType: QueueJobTypes.CustomRequest,
        params: {
          bucket: process.env.S3_DOCUMENTS_BUCKET,
          files: req.files,
          query: req.body.prompt,
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
