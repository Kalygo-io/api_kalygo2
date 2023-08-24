import { Request, Response, NextFunction } from "express";
import { stripe } from "@/clients/stripe_client";
import prisma from "@db/prisma_client";
import pick from "lodash.pick";

export async function createAccessGroup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("createAccessGroup");
    res.status(501).send();
  } catch (e) {
    next(e);
  }
}
