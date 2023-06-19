import { Request, Response, NextFunction } from "express";
import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import argon2 from "argon2";
import { v4 } from "uuid";

import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { generateVerifyEmail_SES_Config } from "@emails/verifyEmail";

import { sesClient } from "@/clients/ses_client";
import config from "@/config";

export async function subscriptionSignUp(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("req.body", req.body);

    const { email, password } = req.body;

    const count = await prisma.account.count();

    if (count > config.limit.maxAccounts) {
      throw new Error("RATE_LIMIT");
    }

    const customer: any = await stripe.customers.create({
      // @ts-ignore
      email: email,
      description: "Kalygo customer",
    });

    // hash password and store in db
    const passwordHash = await argon2.hash(password);
    const emailVerificationToken = v4();

    const result = await prisma.account.create({
      data: {
        email,
        passwordHash,
        emailVerificationToken,
        stripeId: customer.id,
      },
    });

    /* ADD CARD */
    const addCardStripeResp = await stripe.customers.createSource(customer.id, {
      source: {
        object: "card",
        exp_month: req.body.exp_month,
        exp_year: req.body.exp_year,
        number: req.body.card_number,
        cvc: req.body.cvc,
      },
    });

    console.log("addCardStripeResp", addCardStripeResp);

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: config.stripe.products.kalygoPremiumPlan.price }],
      trial_period_days: 14, // UNIX timestamp of when first default payment source will be charged
    });

    console.log("subscription", subscription); // prod_O5vJPAJqU617nh

    const emailConfig = generateVerifyEmail_SES_Config(
      email,
      `${process.env.FRONTEND_HOSTNAME}/verify-email?email=${email}&email-verification-token=${emailVerificationToken}`
    );
    await sesClient.send(new SendTemplatedEmailCommand(emailConfig));

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
