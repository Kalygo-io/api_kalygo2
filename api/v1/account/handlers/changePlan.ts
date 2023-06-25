import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import get from "lodash.get";
import { Request, Response, NextFunction } from "express";
import config from "@/config";

export async function changePlan(
  req: Request<{
    subscriptionPlan: string;
  }>,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("PATCH /change-plan");

    const { subscriptionPlan } = req.body;

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    const subscriptions = await stripe.subscriptions.list({
      customer: account?.stripeId,
    });

    let cards;
    switch (subscriptionPlan) {
      case "FREE":
        for (let s of get(subscriptions, "data")) {
          await stripe.subscriptions.cancel(s.id);
        }
        break;
      case "STANDARD":
        cards = await stripe.customers.listSources(account?.stripeId, {
          object: "card",
        });
        if (get(cards, "data").length === 0) res.status(402).send();
        for (let s of get(subscriptions, "data")) {
          await stripe.subscriptions.cancel(s.id);
        }
        break;
      case "PREMIUM":
        cards = await stripe.customers.listSources(account?.stripeId, {
          object: "card",
        });
        if (get(cards, "data").length === 0) {
          res.status(402).send();
          return;
        } else if (get(subscriptions, "data", []).length === 0) {
          await stripe.subscriptions.create({
            customer: account?.stripeId,
            items: [{ price: config.stripe.products.kalygoPremiumPlan.price }],
            trial_period_days: 14, // UNIX timestamp of when first default payment source will be charged
          });
        } else {
          throw new Error("Existing subscription exists");
        }
        break;
      default:
        throw "Unsupported Subscription Plan";
    }

    await prisma.account.updateMany({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
      data: {
        subscriptionPlan: subscriptionPlan,
      },
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
