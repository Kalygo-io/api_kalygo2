import { stripe } from "@/clients/stripe_client";
import { Request, Response, NextFunction } from "express";
import prisma from "@db/prisma_client";

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

    if (account?.stripeId) {
      /* ADD CARD */

      const addCardStripeResp = await stripe.customers.deleteSource(
        account?.stripeId,
        req.body.card_id
      );

      console.log("addCardStripeResp", addCardStripeResp);
      res.status(200).send();
    } else {
      res.status(400).send();
    }
  } catch (e) {
    next(e);
  }
}
