import { Request, Response, NextFunction } from "express";
import { stripe } from "@/clients/stripe_client";
import prisma from "@db/prisma_client";
import pick from "lodash.pick";

export async function getStripeCards(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("getStripeCards");

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });
    console.log("account", account?.email);
    const customerSearchResults = await stripe.customers.search({
      query: `email:\'${account?.email}\'`,
      limit: 1,
    });
    if (!customerSearchResults.data[0]) {
      res.status(404).send();
    } else {
      const cards = await stripe.customers.listSources(
        customerSearchResults.data[0].id
      );
      console.log("account's cards in Stripe", cards);
      res.status(200).json(cards.data);
    }
  } catch (e) {
    next(e);
  }
}
