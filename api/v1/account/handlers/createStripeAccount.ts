import { stripe } from "@/clients/stripe_client";
import { Request, Response, NextFunction } from "express";
import prisma from "@db/prisma_client";

export async function createStripeAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET createStripeAccount");

    res.status(501).send();
    return;

    // const result = await prisma.account.findFirst({
    //   where: {
    //     // @ts-ignore
    //     email: req.user.email,
    //   },
    // });

    // if (!result?.stripe_Id) { // HACK
    //   const customer: any = await stripe.customers.create({
    //     // @ts-ignore
    //     email: req.user.email,
    //     description: "Kalygo customer",
    //   });

    //   await prisma.account.updateMany({
    //     where: {
    //       // @ts-ignore
    //       email: req.user.email,
    //     },
    //     data: {
    //       stripe_Id: customer.id, // HACK
    //     },
    //   });

    //   res.status(201).send();
    // } else {
    //   res.status(200).send();
    // }
  } catch (e) {
    next(e);
  }
}
