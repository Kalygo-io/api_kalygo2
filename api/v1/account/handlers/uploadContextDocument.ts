import { Request, Response, NextFunction } from "express";
import { jobQueue } from "@/clients/bull_client";
import { QueueJobTypes } from "@/types/JobTypes";
import prisma from "@/db/prisma_client";
import { Account } from "@prisma/client";

export async function uploadContextDocument(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST uploadContextDocument");
    // console.log("req.file", req.file);
    // console.log("req.body", req.body);

    await prisma.file.create({
      data: {
        bucket: process.env.S3_DOCUMENTS_BUCKET!,
        // @ts-ignore
        key: req.file?.key,
        // @ts-ignore
        originalName: req.file?.originalname,
        accountContextId: parseInt(req.body.accountId),
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
