import { RoleTypes } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export async function isSummaryPublic(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("MIDDLEWARE");
  console.log("req.params", req.params);
  next();
}
