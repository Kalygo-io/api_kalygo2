import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function removeSummaryV2FromAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET remove-summary-v2-from-access-group");

    const { summaryV2Id, accessGroupId } = req.body;

    console.log("***", summaryV2Id, accessGroupId);

    await prisma.summaryV2sAndAccessGroups.deleteMany({
      where: {
        accessGroupId: accessGroupId,
        summaryV2Id: summaryV2Id,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
