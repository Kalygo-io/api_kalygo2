import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";

export async function deletePromptFromAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("deletePromptFromAccessGroup");

    const { id } = req.params;
    const { promptId } = req.body;

    console.log("accessGroupId", id);
    console.log("promptId", promptId);

    await prisma.promptsAndAccessGroups.deleteMany({
      where: {
        accessGroupId: parseInt(id),
        promptId: parseInt(promptId),
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
