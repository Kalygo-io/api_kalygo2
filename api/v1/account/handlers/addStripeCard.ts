import { stripe } from "@/clients/stripe_client";
import { Request, Response, NextFunction } from "express";
import prisma from "@db/prisma_client";

export async function addStripeCard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST addStripeCard", req.body);
    // Checking that the account exists along with a record in Stripe
    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });
    // GUARD
    if (!account) {
      res.status(500).send();
      return;
    }
    const customerSearchResults = await stripe.customers.search({
      query: `email:\'${account?.email}\'`,
      limit: 1,
    });
    // If no Stripe customer exists create a Stripe account for the customer
    if (!customerSearchResults.data[0]) {
      // prettier-ignore
      console.log("no Stripe customer found with caller's email so creating created new one...");
      /* CREATE STRIPE ID */
      const newCustomer: any = await stripe.customers.create({
        email: account.email,
        description: "Kalygo customer",
      });
      console.log("newCustomer object in Stripe created successfully...");
      /* ADD CARD */
      const addCardStripeResp = await stripe.customers.createSource(
        newCustomer.id,
        {
          source: {
            object: "card",
            exp_month: req.body.exp_month,
            exp_year: req.body.exp_year,
            number: req.body.card_number,
            cvc: req.body.cvc,
          },
        }
      );
      res.status(200).json(addCardStripeResp);
    } else {
      // prettier-ignore
      console.log("Stripe customer with caller's email exists...");
      const addCardStripeResp = await stripe.customers.createSource(
        customerSearchResults.data[0].id,
        {
          source: {
            object: "card",
            exp_month: req.body.exp_month,
            exp_year: req.body.exp_year,
            number: req.body.card_number,
            cvc: req.body.cvc,
          },
        }
      );
      res.status(200).json(addCardStripeResp);
    }
  } catch (e) {
    next(e);
  }
}
