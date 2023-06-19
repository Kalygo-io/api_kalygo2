import { stripe } from "@/clients/stripe_client";
import { Request, Response, NextFunction } from "express";
import prisma from "@db/prisma_client";
import get from "lodash.get";

export async function deleteStripeCard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("DELETE deleteStripeCard");

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    console.log("account", account);

    const subscriptions = await stripe.subscriptions.list({
      customer: account?.stripeId,
    });

    if (account?.stripeId && get(subscriptions, "data").length === 0) {
      const addCardStripeResp = await stripe.customers.deleteSource(
        account?.stripeId,
        req.body.card_id
      );

      console.log("addCardStripeResp", addCardStripeResp);
      res.status(200).send();
    } else {
      res.status(402).send();
    }
  } catch (e) {
    next(e);
  }
}
