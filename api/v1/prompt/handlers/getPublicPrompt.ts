import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function getPublicPrompt(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET getPublicPrompt");

    // const account = await prisma.account.findFirst({
    //   where: {
    //     // @ts-ignore
    //     email: req.user.email,
    //   },
    // });
    // console.log("account", account);
    // console.log("req.params.id", req.params.id);

    const prompt = await prisma.prompt.findFirst({
      where: {
        id: parseInt(req.params.id),
      },
      include: {
        Ratings: true,
        PromptsAndAccessGroups: {
          include: {
            accessGroup: true,
          },
        },
      },
    });

    console.log("prompt", prompt);

    if (prompt) {
      res.status(200).json(prompt);
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
