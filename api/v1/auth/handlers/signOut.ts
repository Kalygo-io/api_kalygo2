import prisma from "@db/prisma_client";
import { Request, Response, NextFunction } from "express";

export async function signOut(req: Request, res: Response, next: NextFunction) {
  try {
    // @ts-ignore
    let { email } = req.user;

    const result = await prisma.account.findFirst({
      where: {
        email,
      },
    });

    if (result) {
      res.status(200).clearCookie("jwt").send();
    } else res.status(404).clearCookie("jwt").send();
  } catch (e) {
    next(e);
  }
}
