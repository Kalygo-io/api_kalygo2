import { Request, Response, NextFunction } from "express";
import { jobQueue } from "@/clients/bull_client";
import { encoding_for_model } from "@dqbd/tiktoken";
import { QueueJobTypes } from "@/types/JobTypes";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function summarizeV2(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST summarizeV2");
    console.log("req.files", req.files);
    console.log("req.body", req.body);
    let language: string = req?.i18n?.language?.substring(0, 2) || "en";

    const userOpenAiCharges = await prisma.openAiCharges.findMany({
      where: {
        // @ts-ignore
        accountId: req.user.id,
      },
    });
    let totalCharges = userOpenAiCharges.reduce(
      (total, charge) => total + charge.amount,
      0
    );
    if (totalCharges > 5) {
      res.status(403).json({ error: "You have exceeded the limit" });
      return;
    }

    jobQueue.add(
      {
        jobType: QueueJobTypes.SummaryV2,
        params: {
          bucket: process.env.S3_DOCUMENTS_BUCKET,
          files: req.files,
          customizations: {
            format: req.body.format,
            type: req.body.type,
            length: req.body.length,
            language: req.body.language,
          },
          // @ts-ignore
          email: req.user.email,
          language: language,
        },
      },
      {
        // timeout: 600000,
        timeout: 1000 * 60 * 60,
      }
    );

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
