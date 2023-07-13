import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function accountSummaries(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET account-summaries");

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    const summaries = await prisma.summary.findMany({
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
      where: {
        // @ts-ignore
        requesterId: account?.id,
      },
    });

    // console.log("account", account);
    // console.log("accountSummaries", summaries);

    res.status(200).json(summaries || []);
  } catch (e) {
    next(e);
  }
} 
