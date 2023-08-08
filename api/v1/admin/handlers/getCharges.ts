import { stripe } from "@/clients/stripe_client";
import prisma from "@/db/prisma_client";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";
import pick from "lodash.pick";

export async function getCharges(
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

    let stripeCharges: any[] = [];
    let response = await stripe.charges.list({
      limit: 100,
    });
    while (response.has_more) {
      const lastChargeInResponse = response.data[response.data.length - 1];
      response = await stripe.charges.list({
        limit: 100,
        starting_after: lastChargeInResponse.id,
      });

      stripeCharges = [...stripeCharges, ...response.data];
    }
    res.status(200).json({
      total: stripeCharges.length,
      stripeCustomers: stripeCharges.slice(
        page * perPage,
        page * perPage + perPage
      ),
    });
  } catch (e) {
    next(e);
  }
}
