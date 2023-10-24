import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";

export async function removeSummaryV3FromAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET remove-summary-v3-from-access-group");

    const { summaryV3Id, accessGroupId } = req.body;

    console.log("***", summaryV3Id, accessGroupId);

    await prisma.summaryV3sAndAccessGroups.deleteMany({
      where: {
        accessGroupId: accessGroupId,
        summaryV3Id: summaryV3Id,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
