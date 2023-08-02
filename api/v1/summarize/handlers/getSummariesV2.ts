import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function getSummariesV2(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET summaries-v2");

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    const summaries = await prisma.summaryV2.findMany({
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

    res.status(200).json(summaries || []);
  } catch (e) {
    next(e);
  }
}
