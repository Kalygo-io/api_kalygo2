import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function addToAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET add-to-access-group");

    const { customRequestId, accessGroupId } = req.body;

    console.log("customRequestId", customRequestId);
    console.log("accessGroupId", accessGroupId);
    // @ts-ignore
    console.log("createdBy", req.user.email);

    await prisma.customRequestsAndAccessGroups.create({
      data: {
        accessGroupId: accessGroupId,
        customRequestId: customRequestId,
        // @ts-ignore
        createdBy: req.user.email,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
