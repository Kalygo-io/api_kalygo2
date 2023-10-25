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

    const customRequests = await prisma.customRequest.findMany({
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
    console.log("customRequests", customRequests);

    if (customRequests) {
      res.status(200).json(customRequests);
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
