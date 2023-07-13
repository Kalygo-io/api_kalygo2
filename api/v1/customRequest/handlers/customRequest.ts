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

    const userOpenAiCharges = await prisma.openAiCharges.findMany({
      where: {
        // @ts-ignore
        accountId: req.user.id,
      }
    });
    let totalCharges = userOpenAiCharges.reduce((total, charge) => total + charge.amount, 0);
    if (totalCharges > 5) {
      res.status(403).json({ error: "You have exceeded the limit" });
      return;
    }

    jobQueue.add(
      {
        jobType: QueueJobTypes.CustomRequest,
        params: {
          bucket: process.env.S3_DOCUMENTS_BUCKET,
          files: req.files,
          customPrompt: req.body.customPrompt,
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
