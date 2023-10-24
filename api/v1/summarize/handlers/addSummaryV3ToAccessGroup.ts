import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function addSummaryV3ToAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET add-summary-v3-to-access-group");

    const { summaryV3Id, accessGroupId } = req.body;

    await prisma.summaryV3sAndAccessGroups.create({
      data: {
        accessGroupId: accessGroupId,
        summaryV3Id: summaryV3Id,
        // @ts-ignore
        createdBy: req.user.email,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
