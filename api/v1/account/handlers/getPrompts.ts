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
      include: {
        Prompts: true,
      },
    });
    console.log("account", account?.email);
    console.log("Prompts", account?.Prompts);

    res.status(200).send(account?.Prompts || []);
  } catch (e) {
    next(e);
  }
}
