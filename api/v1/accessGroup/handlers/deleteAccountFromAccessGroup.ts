import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";

export async function deleteAccountFromAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("deleteAccountFromAccessGroup");

    const { id } = req.params;
    const { accountId } = req.body;

    console.log("accessGroupId", id);
    console.log("accountId", accountId);

    await prisma.accountsAndAccessGroups.deleteMany({
      where: {
        accessGroupId: parseInt(id),
        accountId: parseInt(accountId),
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
