import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import pick from "lodash.pick";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";

export async function downloadFile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET downloadFile");

    res.status(501).send();
  } catch (e) {
    next(e);
  }
}
