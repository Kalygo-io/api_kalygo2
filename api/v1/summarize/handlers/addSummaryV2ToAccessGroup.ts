import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function addSummaryV2ToAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET add-to-access-group");

    const { summaryV2Id, accessGroupId } = req.body;

    await prisma.summaryV2sAndAccessGroups.create({
      data: {
        accessGroupId: accessGroupId,
        summaryV2Id: summaryV2Id,
        // @ts-ignore
        createdBy: req.user.email,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
