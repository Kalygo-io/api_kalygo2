import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function removeFromAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET remove-from-access-group");

    const { customRequestId, accessGroupId } = req.body;

    console.log("***", customRequestId, accessGroupId);

    await prisma.customRequestsAndAccessGroups.deleteMany({
      where: {
        accessGroupId: accessGroupId,
        customRequestId: customRequestId,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
