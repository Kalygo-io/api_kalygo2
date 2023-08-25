import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function addToAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET add-to-access-group");

    const { summaryId, accessGroupId } = req.body;

    await prisma.summariesAndAccessGroups.create({
      data: {
        accessGroupId: accessGroupId,
        summaryId: summaryId,
        // @ts-ignore
        createdBy: req.user.email,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
