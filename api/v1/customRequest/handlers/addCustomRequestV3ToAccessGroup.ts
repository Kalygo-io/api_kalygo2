import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function addCustomRequestV3ToAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET add-custom-request-v3-to-access-group");

    const { customRequestV3Id, accessGroupId } = req.body;

    console.log("customRequestV3Id", customRequestV3Id);
    console.log("accessGroupId", accessGroupId);
    // @ts-ignore
    console.log("createdBy", req.user.email);

    await prisma.customRequestV3sAndAccessGroups.create({
      data: {
        accessGroupId: accessGroupId,
        customRequestV3Id: customRequestV3Id,
        // @ts-ignore
        createdBy: req.user.email,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
