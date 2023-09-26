import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";

export async function addAccountToAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("addAccountToAccessGroup");

    const { id } = req.params;
    const { email } = req.body;

    console.log("accessGroupId", id);
    console.log("email", email);

    const account = await prisma.account.findFirst({
      where: {
        email: email,
      },
    });

    await prisma.accountsAndAccessGroups.create({
      data: {
        accessGroupId: parseInt(id),
        accountId: account?.id!,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
