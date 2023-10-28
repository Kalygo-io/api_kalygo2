import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function getCustomRequestV3s(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET getCustomRequests");

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    console.log("account", account);
    console.log("req.params.id", req.params.id);

    const customRequestV3 = await prisma.customRequestV3.findMany({
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
    console.log("customRequestV3", customRequestV3);

    if (customRequestV3) {
      res.status(200).json(customRequestV3);
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
