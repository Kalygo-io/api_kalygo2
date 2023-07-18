import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";
import argon2 from "argon2";
import { v4 } from "uuid";

import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { generateVerifyEmail_SES_Config } from "@emails/verifyEmail";
import { sesClient } from "@/clients/ses_client";
import { stripe } from "@/clients/stripe_client";

export async function signUp(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const count = await prisma.account.count();

    if (count > 400) {
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

    const account = await prisma.account.create({
      data: {
        email,
        passwordHash,
        emailVerificationToken,
        stripeId: customer.id,
      },
    });

    const role = await prisma.role.create({
      data: {
        type: "USER",
        accountId: account.id,
      },
    });

    // FREE CREDITS

    const summaryCredits = await prisma.summaryCredits.create({
      data: {
        accountId: account!.id,
        amount: 2,
      },
    });

    const vectorSearchCredits = await prisma.vectorSearchCredits.create({
      data: {
        accountId: account!.id,
        amount: 2,
      },
    });

    // const customRequestCredits = await prisma.customRequestCredits.create({
    //   data: {
    //     accountId: account!.id,
    //     amount: 2,
    //   },
    // });

    const emailConfig = generateVerifyEmail_SES_Config(
      email,
      `${process.env.FRONTEND_HOSTNAME}/verify-email?email=${email}&email-verification-token=${emailVerificationToken}`,
      req
      // `${process.env.FRONTEND_HOSTNAME}/verify-email`
    );
    await sesClient.send(new SendTemplatedEmailCommand(emailConfig));

    res.status(200).send();
  } catch (e) {
    console.log("BIG ERROR WITH SIGNUP");
    next(e);
  }
}
