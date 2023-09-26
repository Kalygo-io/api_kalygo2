import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";

export async function deleteCustomRequestFromAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("deleteCustomRequestFromAccessGroup");

    const { id } = req.params;
    const { customRequestId } = req.body;

    console.log("accessGroupId", id);
    console.log("customRequestId", customRequestId);

    await prisma.customRequestsAndAccessGroups.deleteMany({
      where: {
        accessGroupId: parseInt(id),
        customRequestId: parseInt(customRequestId),
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
