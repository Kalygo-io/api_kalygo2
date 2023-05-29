import prisma from "@db/prisma_client";
import { stripe } from "@/stripe_client";
import pick from "lodash.pick";
import { Request, Response, NextFunction } from "express";

export async function patchAccount(
  req: Request<{
    firstName: string;
    lastName: string;
  }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { firstName, lastName } = req.body;

    await prisma.account.updateMany({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
      data: {
        firstName: firstName,
        lastName: lastName,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
