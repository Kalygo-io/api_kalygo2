import { Request, Response, NextFunction } from "express";
import prisma from "@db/prisma_client";

export async function getPrompt(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    console.log("GET /prompt/:id", id);

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    const prompt = await prisma.prompt.findFirst({
      where: {
        id: parseInt(id),
        ownerId: account?.id,
      },
    });

    console.log("SEARCH results", prompt);

    res.status(200).send(prompt);
  } catch (e) {
    next(e);
  }
}
