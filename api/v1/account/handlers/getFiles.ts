import { Request, Response, NextFunction } from "express";
import { stripe } from "@/clients/stripe_client";
import prisma from "@db/prisma_client";
import pick from "lodash.pick";

export async function getFiles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("getFiles");

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    const files = await prisma.file.findMany({
      where: {
        // @ts-ignore
        ownerId: account.id,
      },
      include: {
        CustomRequest: true,
        Summary: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("account", account?.email);

    res.status(200).send(files || []);
  } catch (e) {
    next(e);
  }
}
