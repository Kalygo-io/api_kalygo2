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
        email: "a@a.com",
      },
    });

    console.log("account", account);

    const accountAccessGroups = await prisma.accessGroup.findMany({
      where: {
        createdById: account?.id,
      },
      include: {},
    });

    console.log("accountAccessGroups", accountAccessGroups);

    res.status(200).json(accountAccessGroups);
  } catch (e) {
    next(e);
  }
}
