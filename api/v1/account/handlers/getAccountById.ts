import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import pick from "lodash.pick";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";

export async function getAccountById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET /api/v1/account/:id");

    // res.status(501).json({});
    res.status(200).json({});
  } catch (e) {
    console.log("ERROR in getAccountById", e);

    next(e);
  }
}
