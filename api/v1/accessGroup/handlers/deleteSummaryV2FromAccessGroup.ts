import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";

export async function deleteSummaryV2FromAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("deleteSummaryV2FromAccessGroup");

    const { id } = req.params;
    const { summaryV2Id } = req.body;

    console.log("accessGroupId", id);
    console.log("summaryV2Id", summaryV2Id);

    await prisma.summaryV2sAndAccessGroups.deleteMany({
      where: {
        accessGroupId: parseInt(id),
        summaryV2Id: parseInt(summaryV2Id),
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
