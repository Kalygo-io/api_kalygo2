import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import pick from "lodash.pick";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";

export async function getAccountById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET /api/v1/account/:id");

    console.log("req.params.id", req.params.id);

    const account = await prisma.account.findFirst({
      where: {
        id: parseInt(req.params?.id),
      },
      include: {
        SummaryCredits: true,
        VectorSearchCredits: true,
        CustomRequestCredits: true,
        UsageCredits: true,
      },
    });

    // res.status(501).json({});
    // res.status(200).json(account);

    res.status(200).json({
      ...pick(account, ["email", "subscriptionPlan", "firstName", "lastName"]),
      // subscriptions: subscriptions,
      // stripeDefaultSource: newStripeCustomer.default_source,
      summaryCredits: get(account, "SummaryCredits.amount", 0),
      vectorSearchCredits: get(account, "VectorSearchCredits.amount", 0),
      customRequestCredits: get(account, "CustomRequestCredits.amount", 0),
      usageCredits: get(account, "UsageCredits.amount", 0),
    });
  } catch (e) {
    console.log("ERROR in getAccountById", e);

    next(e);
  }
}
