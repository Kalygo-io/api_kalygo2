import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";

// import { Account } from "@db/models/Account";

export async function verifyAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let { email, emailVerificationToken } = req.body;

    const result = await prisma.account.findFirst({
      where: {
        email,
        emailVerificationToken: emailVerificationToken,
      },
    });

    if (result) {
      const updatedAccount = await prisma.account.updateMany({
        where: {
          email: email,
          emailVerificationToken: emailVerificationToken,
        },
        data: {
          emailVerificationToken: null,
          emailVerified: true,
        },
      });

      res.status(200).send();
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
