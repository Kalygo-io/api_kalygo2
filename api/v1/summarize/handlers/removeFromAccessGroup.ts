import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function removeFromAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET remove-from-access-group");

    const { summaryId, accessGroupId } = req.body;

    console.log("***", summaryId, accessGroupId);

    await prisma.summariesAndAccessGroups.deleteMany({
      where: {
        accessGroupId: accessGroupId,
        summaryId: summaryId,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
