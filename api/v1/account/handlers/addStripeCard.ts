import { stripe } from "@/clients/stripe_client";
import { Request, Response, NextFunction } from "express";
import prisma from "@db/prisma_client";

export async function addStripeCard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET addStripeCard", req.body);

    const result = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    if (!result?.stripeId) {
      /* CREATE STRIPE ID */

      const customer: any = await stripe.customers.create({
        // @ts-ignore
        email: req.user.email,
        description: "Kalygo customer",
      });

      /* PATCH ACCOUNT WITH STRIPE ID */

      await prisma.account.updateMany({
        where: {
          // @ts-ignore
          email: req.user.email,
        },
        data: {
          stripeId: customer.id,
        },
      });

      /* ADD CARD */

      const addCardStripeResp = await stripe.customers.createSource(
        customer.id,
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

      console.log("addCardStripeResp", addCardStripeResp);
      res.status(200).send();
    } else {
      const addCardStripeResp = await stripe.customers.createSource(
        result.stripeId,
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
