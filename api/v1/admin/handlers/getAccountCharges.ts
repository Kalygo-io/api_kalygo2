import { stripe } from "@/clients/stripe_client";
import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";
import pick from "lodash.pick";

export async function getAccountCharges(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("req.query", req.query);

    const account = await prisma.account.findFirst({
      where: {
        id: parseInt(req.query?.account_id as string),
      },
    });

    const customerSearchResults = await stripe.customers.search({
      query: `email:\'${account?.email}\'`,
      limit: 1,
    });

    console.log("customerSearchResults", customerSearchResults);

    let stripeCharges: any[] = [];
    let response = await stripe.charges.search({
      query: `customer:\'${customerSearchResults?.data[0]?.id}\'`,
      limit: 100,
    });

    stripeCharges = [...response.data];
    while (response.has_more) {
      const lastChargeInResponse = response.data[response.data.length - 1];
      response = await stripe.charges.search({
        query: `email:\'${account?.email}\'`,
        limit: 100,
        starting_after: lastChargeInResponse.id,
      });

      stripeCharges = [...stripeCharges, ...response.data];
    }
    res.status(200).json({
      total: stripeCharges.length,
      stripeCharges: stripeCharges,
    });
  } catch (e) {
    next(e);
  }
}
