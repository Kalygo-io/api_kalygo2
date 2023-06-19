import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import pick from "lodash.pick";
import { Request, Response, NextFunction } from "express";

export async function getAccount(
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
    });

    let subscriptions = {
      data: [],
    };
    if (account?.stripeId) {
      subscriptions = await stripe.subscriptions.list({
        customer: account?.stripeId,
      });
    }

    if (account) {
      res.status(200).json({
        ...pick(account, [
          "email",
          "firstName",
          "lastName",
          "subscriptionPlan",
        ]),
        subscriptions: subscriptions,
      });
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
