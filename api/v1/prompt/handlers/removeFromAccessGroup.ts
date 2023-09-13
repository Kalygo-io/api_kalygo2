import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function removeFromAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET remove-from-access-group");

    const { promptId, accessGroupId } = req.body;

    console.log("***", promptId, accessGroupId);

    await prisma.promptsAndAccessGroups.deleteMany({
      where: {
        accessGroupId: accessGroupId,
        promptId: promptId,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
