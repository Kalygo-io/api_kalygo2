import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function removeCustomRequestV3FromAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET remove-custom-request-v3-from-access-group");

    const { customRequestV3Id, accessGroupId } = req.body;

    console.log("***", customRequestV3Id, accessGroupId);

    await prisma.customRequestV3sAndAccessGroups.deleteMany({
      where: {
        accessGroupId: accessGroupId,
        customRequestV3Id: customRequestV3Id,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
