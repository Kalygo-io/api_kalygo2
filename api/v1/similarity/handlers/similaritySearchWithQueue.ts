import { Request, Response, NextFunction } from "express";
import { jobQueue } from "@/clients/bull_client";
import { QueueJobTypes } from "@/types/JobTypes";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function similaritySearchWithQueue(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST similaritySearchWithQueue");
    // console.log(req.body.files);
    // console.log(req.file);

    // let language: string = req?.i18n?.language?.substring(0, 2) || "en";
    // const query = req.body.query;

    // const userOpenAiCharges = await prisma.openAiCharges.findMany({
    //   where: {
    //     // @ts-ignore
    //     accountId: req.user.id,
    //   }
    // });
    // let totalCharges = userOpenAiCharges.reduce((total, charge) => total + charge.amount, 0);
    // if (totalCharges > 5) {
    //   res.status(403).json({ error: "You have exceeded the limit" });
    //   return;
    // }

    // jobQueue.add(
    //   {
    //     jobType: QueueJobTypes.VectorSearch,
    //     params: {
    //       // @ts-ignore
    //       key: req.file?.key,
    //       originalName: req.file?.originalname,
    //       query: query,
    //       bucket: process.env.S3_DOCUMENTS_BUCKET,
    //       // @ts-ignore
    //       email: req.user.email,
    //       language: language,
    //     },
    //   },
    //   {
    //     timeout: 600000,
    //   }
    // );

    res.status(501).send();
  } catch (e) {
    next(e);
  }
}
