import { Request, Response, NextFunction } from "express";
import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import argon2 from "argon2";
import { v4 } from "uuid";

import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { generateVerifyEmail_SES_Config } from "@emails/verifyEmail";

import { sesClient } from "@/clients/ses_client";
import config from "@/config";

export async function purchaseCredits(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("req.body", req.body);

    const {
      card: { exp_month, exp_year, card_number, cvc, name },
      credits,
    } = req.body;
    const count = await prisma.account.count();
    if (count > config.limit.maxAccounts) {
      throw new Error("RATE_LIMIT");
    }

    // FIND EXISTING STRIPE CUSTOMER
    const customerSearchResults = await stripe.customers.search({
      // @ts-ignore
      query: `email:\'${req.user.email}\'`,
    });

    /* ADD CARD */
    const addCardStripeResp = await stripe.customers.createSource(
      customerSearchResults.data[0].id,
      {
        source: {
          object: "card",
          exp_month,
          exp_year,
          card_number,
          cvc,
          name,
        },
      }
    );

    console.log("addCardStripeResp", addCardStripeResp);

    // const result = await prisma.account.create({
    //   data: {
    //     email,
    //     passwordHash,
    //     emailVerificationToken,
    //   },
    // });

    // const emailConfig = generateVerifyEmail_SES_Config(
    //   email,
    //   `${process.env.FRONTEND_HOSTNAME}/verify-email?email=${email}&email-verification-token=${emailVerificationToken}`,
    //   req
    // );
    // await sesClient.send(new SendTemplatedEmailCommand(emailConfig));

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
