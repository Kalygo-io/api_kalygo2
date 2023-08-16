import { Request, Response, NextFunction } from "express";
import { stripe } from "@/clients/stripe_client";

export async function getDefaultStripeCard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("getDefaultCard");

    //   stripe.customers.retrieve(stripe_id, function (err, customer) { // HACK
    //     if (err) {
    //       return res.status(400).json({
    //         success: false,
    //         message: "Error occured with our payment gateway",
    //       });
    //     } else {
    //       return res.status(200).json({
    //         success: true,
    //         message: "Successfully retrieved your default payment source",
    //         default_source: customer.default_source,
    //       });
    //     }
    //   });
  } catch (e) {
    next(e);
  }
}
