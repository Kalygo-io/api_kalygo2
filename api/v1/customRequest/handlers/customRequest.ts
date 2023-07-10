import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import pick from "lodash.pick";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";

export async function customRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST custom-request");

    console.log("req.body.prompt", req.body.prompt);
    console.log("req.files", req.files as any);

    res.status(501).send();
  } catch (e) {
    next(e);
  }
}
