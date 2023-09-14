import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";

export async function getAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("getAccessGroup");

    const { id } = req.params;

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    const record = await prisma.accessGroup.findFirst({
      where: {
        id: parseInt(id),
        createdById: account?.id!,
      },
    });

    res.status(200).send(record);
  } catch (e) {
    next(e);
  }
}
