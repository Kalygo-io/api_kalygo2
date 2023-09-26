import prisma from "@/db/prisma_client";
import { RoleTypes } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export async function isAccessGroupOwner(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("MIDDLEWARE");
  console.log("req.params", req.params);

  const { id } = req.params;

  const caller = await prisma.account.findFirst({
    where: {
      // @ts-ignore
      email: req?.user?.email,
    },
  });

  const accessGroups = await prisma.accessGroup.findFirstOrThrow({
    where: {
      id: parseInt(id),
    },
  });

  if (accessGroups.createdById === caller?.id) {
    next();
  } else {
    res.status(403).send();
  }
}
