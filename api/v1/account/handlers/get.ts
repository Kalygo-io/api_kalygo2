import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import pick from "lodash.pick";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";

export async function getAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET account");

    // @ts-ignore
    // console.log("req.user", req.user);

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
      include: {
        SummaryCredits: true,
        VectorSearchCredits: true,
        CustomRequestCredits: true,
        UsageCredits: true,
      },
    });

    const customerSearchResults = await stripe.customers.search({
      query: `email:\'${account?.email}\'`,
      limit: 1,
    });

    let subscriptions = {
      data: [],
    };

    if (!customerSearchResults.data[0]) {
      res.status(200).json({
        ...pick(account, [
          "email",
          "firstName",
          "lastName",
          "subscriptionPlan",
        ]),
        subscriptions: subscriptions,
        stripeDefaultSource: null,
        summaryCredits: get(account, "SummaryCredits.amount", 0),
        vectorSearchCredits: get(account, "VectorSearchCredits.amount", 0),
        customRequestCredits: get(account, "CustomRequestCredits.amount", 0),
        usageCredits: get(account, "UsageCredits.amount"),
      });
    } else {
      console.log("account", account);

      subscriptions = await stripe.subscriptions.list({
        customer: customerSearchResults.data[0].id,
      });

      res.status(200).json({
        ...pick(account, [
          "email",
          "firstName",
          "lastName",
          "subscriptionPlan",
        ]),
        subscriptions: subscriptions,
        stripeDefaultSource: customerSearchResults.data[0]?.default_source,
        summaryCredits: get(account, "SummaryCredits.amount", 0),
        vectorSearchCredits: get(account, "VectorSearchCredits.amount", 0),
        customRequestCredits: get(account, "CustomRequestCredits.amount", 0),
        usageCredits: get(account, "UsageCredits.amount"),
      });
    }
  } catch (e) {
    next(e);
  }
}
