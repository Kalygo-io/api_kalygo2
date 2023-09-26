import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";

export async function deleteSummaryFromAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("deleteSummaryFromAccessGroup");

    const { id } = req.params;
    const { summaryId } = req.body;

    console.log("accessGroupId", id);
    console.log("summaryId", summaryId);

    await prisma.summariesAndAccessGroups.deleteMany({
      where: {
        accessGroupId: parseInt(id),
        summaryId: parseInt(summaryId),
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
