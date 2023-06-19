import { stripe } from "@/clients/stripe_client";
import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";

export async function cancelSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("cancelSubscription");
    const { subscriptionId } = req.body;
    await stripe.subscriptions.cancel(subscriptionId);
    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
