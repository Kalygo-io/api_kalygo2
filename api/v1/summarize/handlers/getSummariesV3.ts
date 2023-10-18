import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function getSummariesV3(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET summaries-v3");

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    const summaries = await prisma.summaryV3.findMany({
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
