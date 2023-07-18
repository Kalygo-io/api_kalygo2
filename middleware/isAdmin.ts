import { RoleTypes } from "@/types/RoleTypes";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { NextFunction, Request, Response } from "express";

export default async function isAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = (req as any).user;

  console.log("user", user);

  if (user) {
    const roles = user.roles || [];

    if (roles.some((role: string) => role === RoleTypes.ADMIN)) {
      next();
    } else {
      res.status(403).send("Access Denied");
    }
  } else {
    res.status(403).send("Access Denied");
  }
}
