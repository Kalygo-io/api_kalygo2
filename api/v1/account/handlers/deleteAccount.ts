import { stripe } from "@/clients/stripe_client";
import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";

export async function deleteAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const account = await prisma.account.update({
      data: {
        markAsDeleted: true,
      },
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });
    res.status(200).clearCookie("jwt").send();
  } catch (e) {
    next(e);
  }
}
