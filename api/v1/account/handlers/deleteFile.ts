import { Request, Response, NextFunction } from "express";
// import request from 'request'
import prisma from "@/db/prisma_client";
import { s3 } from "@/clients/s3_client";

export async function deleteFile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("DELETE delete-file");

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    const file = await prisma.file.deleteMany({
      where: {
        id: parseInt(req.body.id),
        ownerId: account?.id,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
