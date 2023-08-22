import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import pick from "lodash.pick";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";

export async function getPurchaseHistory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET getPurchaseHistory");

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
        UsageCredits: true,
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
      const charges = await stripe.charges.search({
        query: `customer:\'${customerSearchResults.data[0].id}\'`,
        limit: 100,
      });

      res.status(200).json(charges);
    }
  } catch (e) {
    next(e);
  }
}
