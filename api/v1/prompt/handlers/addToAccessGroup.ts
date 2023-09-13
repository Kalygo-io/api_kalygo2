import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function addToAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET add-to-access-group");

    const { promptId, accessGroupId } = req.body;

    console.log("promptId", promptId);
    console.log("accessGroupId", accessGroupId);
    // @ts-ignore
    console.log("createdBy", req.user.email);

    await prisma.promptsAndAccessGroups.create({
      data: {
        accessGroupId: accessGroupId,
        promptId: promptId,
        // @ts-ignore
        createdBy: req.user.email,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
