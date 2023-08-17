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
    // TODO REFACTOR TO MIDDLEWARE
    let activeJobs = await jobQueue.getJobs(["active", "waiting", "failed"]);
    const foundActiveJob = activeJobs.find((val, idx) => {
      // @ts-ignore
      return get(val, "data.params.email") === req.user.email;
    });
    // GUARD
    if (foundActiveJob) {
      res.status(402).send();
      return;
    }
    // GUARD
    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });
    if (!account) {
      res.status(500).send();
      return;
    }
    //
    const customerSearchResults = await stripe.customers.search({
      query: `email:\'${account?.email}\'`,
      limit: 1,
    });
    // If no Stripe customer exists create a Stripe account for the customer
    if (!customerSearchResults.data[0]) {
      res.status(404).send();
    } else {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerSearchResults.data[0].id,
      });

      if (
        customerSearchResults.data[0].id &&
        get(subscriptions, "data", []).length === 0
      ) {
        for (let s of get(subscriptions, "data")) {
          await stripe.subscriptions.cancel(s.id);
        }
        const stripeResp = await stripe.customers.deleteSource(
          customerSearchResults.data[0].id,
          req.body.card_id
        );
        console.log("stripeResp", stripeResp);
        res.status(200).send();
      } else {
        res.status(402).send();
      }
    }
  } catch (e) {
    next(e);
  }
}
