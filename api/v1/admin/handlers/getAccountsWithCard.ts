import { stripe } from "@/clients/stripe_client";
import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";
import pick from "lodash.pick";

export async function getAccountsWithCard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("req.query", req.query);

    const sortBy: string = req.query.sortBy as string;
    const direction: string = req.query.direction as string;
    const page: number = Number.parseInt(req.query.page as string);
    const perPage: number = Number.parseInt(req.query.perPage as string);

    let stripeCustomers: any[] = [];
    let response = await stripe.customers.list({
      limit: 100,
    });
    let hasCard = response.data.filter(
      (i: any, idx: number) => i.default_source
    );
    stripeCustomers = [...hasCard];
    while (response.has_more) {
      const lastCustomerInResponse = response.data[response.data.length - 1];
      response = await stripe.customers.list({
        limit: 100,
        starting_after: lastCustomerInResponse.id,
      });

      hasCard = response.data.filter((i: any, idx: number) => i.default_source);

      stripeCustomers = [...stripeCustomers, ...hasCard];
    }
    res.status(200).json({
      total: stripeCustomers.length,
      stripeCustomers: stripeCustomers.slice(
        page * perPage,
        page * perPage + perPage
      ),
    });
  } catch (e) {
    next(e);
  }
}
