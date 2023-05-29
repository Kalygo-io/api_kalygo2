import { Request, Response, NextFunction } from "express";
import { stripe } from "@/stripe_client";

export async function getStripeCards(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("getStripeCards");

    // stripe.customers.listCards(req.decoded.stripe_id, function (err, cards) {
    //   if (err) {
    //     console.log(err);
    //     return res.status(400).json({
    //       success: false,
    //       message:
    //         "Error occurred when retrieving all user credit card information",
    //     });
    //   }
    //   console.log(cards);
    //   return res.status(200).json({
    //     success: true,
    //     message: "Successfully retrieved all user credit card information",
    //     cards: cards,
    //   });
    // });
  } catch (e) {
    next(e);
  }
}
