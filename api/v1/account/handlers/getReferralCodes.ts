import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import pick from "lodash.pick";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";

export async function getReferralCodes(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET getReferralCodes");

    // @ts-ignore
    console.log("req.user", req.user);

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    const referralCodes = await prisma.referralCode.findMany({
      where: {
        accountId: account?.id,
      },
    });

    res.status(200).json(referralCodes);
  } catch (e) {
    next(e);
  }
}
