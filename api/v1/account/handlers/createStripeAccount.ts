import { stripe } from "@/stripe_client";
import { Request, Response, NextFunction } from "express";

export async function createStripeAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET createStripeAccount");

    // create Stripe account
    // const customer: any = await stripe.customers.create({
    //   //   email: email,
    //   description: "Kalygo customer",
    // });

    // console.log(customer.id);

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
