import { Request, Response, NextFunction } from "express";
import { stripe } from "@/stripe_client";
import prisma from "@db/prisma_client";
import pick from "lodash.pick";

export async function getStripeCards(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("getStripeCards");

    // @ts-ignore
    console.log("req.user", req.user);

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    console.log("account", account);

    if (account) {
      const cards = await stripe.customers.listSources(account.stripeId);

      console.log("cards", cards);

      res.status(200).json(cards.data);
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
