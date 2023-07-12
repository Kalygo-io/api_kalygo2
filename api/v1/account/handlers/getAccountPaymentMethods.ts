import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import pick from "lodash.pick";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";

export async function getAccountPaymentMethods(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET account");

    // @ts-ignore
    console.log("req.user", req.user);

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
      include: {
        SummaryCredits: true,
        VectorSearchCredits: true,
        CustomRequestCredits: true,
      },
    });

    let subscriptions = {
      data: [],
    };

    let stripeCustomer = null;
    if (account?.stripeId) {
      subscriptions = await stripe.subscriptions.list({
        customer: account?.stripeId,
      });

      stripeCustomer = await stripe.customers.retrieve(account.stripeId);
    }

    if (account) {
      res.status(200).json({
        ...pick(account, ["email", "subscriptionPlan"]),
        subscriptions: subscriptions,
        stripeDefaultSource: stripeCustomer.default_source,
        summaryCredits: get(account, "SummaryCredits.amount", 0),
        vectorSearchCredits: get(account, "VectorSearchCredits.amount", 0),
        customSearchCredits: get(account, "CustomSearchCredits.amount", 0),
      });
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
