import { Request, Response, NextFunction } from "express";
import { jobQueue } from "@/clients/bull_client";
import { QueueJobTypes } from "@/types/JobTypes";
import prisma from "@/db/prisma_client";
import { Account } from "@prisma/client";

export async function uploadAvatar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST uploadAvatar");
    // console.log("req.file", req.file);
    // console.log("req.body", req.body);

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
      include: {
        ProfilePicture: true,
      },
    });

    await prisma.file.upsert({
      where: {
        id: account?.ProfilePicture?.id,
      },
      create: {
        bucket: process.env.S3_DOCUMENTS_BUCKET!,
        // @ts-ignore
        key: req.file?.key,
        // @ts-ignore
        originalName: req.file?.originalname,
        accountForPictureId: parseInt(req.body.accountId),
      },
      update: {
        bucket: process.env.S3_DOCUMENTS_BUCKET!,
        // @ts-ignore
        key: req.file?.key,
        // @ts-ignore
        originalName: req.file?.originalname,
        accountForPictureId: parseInt(req.body.accountId),
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
