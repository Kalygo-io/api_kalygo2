import { Request, Response, NextFunction } from "express";
import prisma from "@db/prisma_client";

export async function deletePrompt(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    await prisma.prompt.deleteMany({
      where: {
        id: parseInt(id),
        ownerId: account?.id,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
