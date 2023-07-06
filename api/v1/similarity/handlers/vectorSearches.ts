import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function getVectorSearches(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET getVectorSearches");

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    console.log("account", account);

    const vectorSearches = await prisma.vectorSearch.findMany({
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

    console.log("account", account);
    console.log("vectorSearches", vectorSearches);

    res.status(200).json(vectorSearches || []);
  } catch (e) {
    next(e);
  }
}
