import { Request, Response, NextFunction } from "express";
import { jobQueue } from "@/clients/bull_client";
import { encoding_for_model } from "@dqbd/tiktoken";
import { QueueJobTypes } from "@/types/JobTypes";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function summarize(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST summarize");
    console.log("req.body", req.body);
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

    for (let i of req.body.files) {
      console.log("<- i ->", i);
      jobQueue.add(
        {
          jobType: QueueJobTypes.Summary,
          params: {
            bucket: process.env.S3_DOCUMENTS_BUCKET,
            key: i.key,
            originalName: i.originalName,
            language: language,
            // @ts-ignore
            email: req.user.email,
          },
        },
        {
          timeout: 600000,
        }
      );
    }

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
