import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";

export async function deleteSummaryV3FromAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("deleteSummaryV3FromAccessGroup");

    const { id } = req.params;
    const { summaryV3Id } = req.body;

    console.log("accessGroupId", id);
    console.log("summaryV3Id", summaryV3Id);

    // await prisma.su.deleteMany({
    //   where: {
    //     accessGroupId: parseInt(id),
    //     summaryV3Id: parseInt(summaryV3Id),
    //   },
    // });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
