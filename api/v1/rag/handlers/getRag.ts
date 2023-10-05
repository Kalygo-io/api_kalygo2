import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function getRag(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("GET getRag");

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    console.log("account", account);
    console.log("req.params.id", req.params.id);

    const ragRequest = await prisma.ragRequest.findFirst({
      where: {
        // @ts-ignore
        requesterId: account?.id,
        id: parseInt(req.params.id),
      },
    });

    console.log("account", account);
    console.log("ragRequest", ragRequest);

    if (ragRequest) {
      res.status(200).json(ragRequest);
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
