import prisma from "@db/prisma_client";
import { stripe } from "@/stripe_client";
import pick from "lodash.pick";
import { Request, Response, NextFunction } from "express";

export async function getAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET account");

    // @ts-ignore
    console.log("req.user", req.user);

    const result = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    if (result) {
      res.status(200).json(pick(result, ["email", "firstName", "lastName"]));
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
