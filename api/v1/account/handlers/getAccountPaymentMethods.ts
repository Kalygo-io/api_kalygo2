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

    console.log("account", account?.email);
    const customerSearchResults = await stripe.customers.search({
      query: `email:\'${account?.email}\'`,
      limit: 1,
    });

    if (!customerSearchResults.data[0]) {
      res.status(404).send();
    } else {
      let subscriptions = {
        data: [],
      };

      let stripeCustomer = null;

      subscriptions = await stripe.subscriptions.list({
        customer: customerSearchResults.data[0].id,
      });

      stripeCustomer = await stripe.customers.retrieve(
        customerSearchResults.data[0].id
      );

      res.status(200).json({
        ...pick(account, ["email", "subscriptionPlan"]),
        subscriptions: subscriptions,
        stripeDefaultSource: stripeCustomer.default_source,
        summaryCredits: get(account, "SummaryCredits.amount", 0),
        vectorSearchCredits: get(account, "VectorSearchCredits.amount", 0),
        customRequestCredits: get(account, "CustomRequestCredits.amount", 0),
      });
    }
  } catch (e) {
    next(e);
  }
}
