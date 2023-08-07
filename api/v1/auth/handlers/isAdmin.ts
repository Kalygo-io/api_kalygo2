import { Request, Response, NextFunction } from "express";
import prisma from "@db/prisma_client";
import { RoleTypes } from "@prisma/client";

export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    // @ts-ignore
    let { email } = req.user;

    const result = await prisma.account.findFirst({
      where: {
        email,
        emailVerified: true,
      },
      include: {
        Roles: true,
      },
    });

    console.log("--- -!-!- ---");
    console.log("result.Roles", result?.Roles);

    if (result?.Roles.some((role) => role.type === RoleTypes.ADMIN)) {
      res.status(200).send();
    } else {
      res.status(403).send();
    }
  } catch (e) {
    next(e);
  }
}
