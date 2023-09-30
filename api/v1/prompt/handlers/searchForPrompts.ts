import { Request, Response, NextFunction } from "express";
import prisma from "@db/prisma_client";

export async function searchForPrompts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    console.log("Prompts /prompts/search", id);

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    const results = await prisma.prompt.findMany({
      where: {
        // id: parseInt(id),
        // ownerId: account?.id,
        prompt: {
          search: req.body.query,
        },
      },
      //   include: {
      //     Ratings: true,
      //     PromptsAndAccessGroups: {
      //       include: {
      //         accessGroup: true,
      //       },
      //     },
      //   },
    });

    res.status(200).json(results);
  } catch (e) {
    next(e);
  }
}
