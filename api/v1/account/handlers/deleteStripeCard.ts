import { stripe } from "@/clients/stripe_client";
import { Request, Response, NextFunction } from "express";
import prisma from "@db/prisma_client";
import { jobQueue } from "@/clients/bull_client";
import get from "lodash.get";

export async function deleteStripeCard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("DELETE deleteStripeCard");

    let activeJobs = await jobQueue.getJobs(["active", "waiting", "failed"]);
    const foundActiveJob = activeJobs.find((val, idx) => {
      // @ts-ignore
      return get(val, "data.params.email") === req.user.email;
    });
    if (foundActiveJob) {
      res.status(402).send();
      return;
    }

    // @ts-ignore
    console.log("req.user", req.user);

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    const subscriptions = await stripe.subscriptions.list({
      customer: account?.stripeId,
    });

    if (account?.stripeId && get(subscriptions, "data", []).length === 0) {
      for (let s of get(subscriptions, "data")) {
        await stripe.subscriptions.cancel(s.id);
      }

      const addCardStripeResp = await stripe.customers.deleteSource(
        account?.stripeId,
        req.body.card_id
      );

      await prisma.account.updateMany({
        where: {
          // @ts-ignore
          email: req.user.email,
        },
        data: {
          subscriptionPlan: "FREE",
        },
      });

      console.log("addCardStripeResp", addCardStripeResp);
      res.status(200).send();
    } else {
      res.status(402).send();
    }
  } catch (e) {
    next(e);
  }
}
