import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function getCustomRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET getCustomRequest");

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    console.log("account", account);
    console.log("req.params.id", req.params.id);

    const customRequest = await prisma.customRequest.findFirst({
      where: {
        // @ts-ignore
        requesterId: account?.id,
        id: parseInt(req.params.id),
      },
      include: {
        Rating: true,
      },
    });

    console.log("account", account);
    console.log("customRequest", customRequest);

    if (customRequest) {
      res.status(200).json(customRequest);
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
