import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function createReferralCode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST createReferralCode");

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
      include: {
        ReferralCodes: true,
      },
    });

    console.log("account", account);
    console.log("req.body.code", req.body.code);

    if ((account?.ReferralCodes?.length || 0) > 8) {
      res.status(500).send();
    } else {
      await prisma.referralCode.create({
        data: {
          // @ts-ignore
          accountId: account?.id,
          code: req.body.code,
        },
      });

      res.status(200).send();
    }
  } catch (e) {
    next(e);
  }
}
