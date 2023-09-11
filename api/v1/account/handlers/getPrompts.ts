import { Request, Response, NextFunction } from "express";
import { stripe } from "@/clients/stripe_client";
import prisma from "@db/prisma_client";
import pick from "lodash.pick";

export async function getPrompts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("getPrompts");

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });
    console.log("account", account?.email);

    // res.status(501).send();
    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
