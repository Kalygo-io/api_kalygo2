import prisma from "@db/prisma_client";
import { Request, Response, NextFunction } from "express";

export async function signOut(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).clearCookie("jwt").send();
  } catch (e) {
    next(e);
  }
}
