import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";

export async function getAccessGroups(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("getAccessGroups");

    // @ts-ignore
    console.log("req.user", req.user);

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    const accountAccessGroups = await prisma.accessGroup.findMany({
      where: {
        createdById: account?.id,
      },
    });

    res.status(200).json(accountAccessGroups);
  } catch (e) {
    console.log("e", e);

    next(e);
  }
}
