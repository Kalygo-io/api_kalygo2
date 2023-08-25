import prisma from "@/db/prisma_client";
import { RoleTypes } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export async function isSummaryPublic(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("MIDDLEWARE");
  console.log("req.params", req.params);

  const { id } = req.params;

  const accessGroups = await prisma.summariesAndAccessGroups.findMany({
    where: {
      summaryId: id ? Number.parseInt(id) : -1,
    },
    include: {
      accessGroup: true,
    },
  });

  let publicAccessGroup = accessGroups.find(
    (v) => v.accessGroupId === 1 && v.accessGroup.name === "Public"
  );

  if (publicAccessGroup) {
    next();
  } else {
    res.status(403).send();
  }
}
