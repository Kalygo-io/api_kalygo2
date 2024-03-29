import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";
import argon2 from "argon2";
import { v4 } from "uuid";

import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { generateVerifyEmail_SES_Config } from "@emails/v2/verifyEmail";
import { sesClient } from "@/clients/ses_client";
import { stripe } from "@/clients/stripe_client";
import { RoleTypes } from "@prisma/client";
import config from "@/config";

export async function signUp(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, referralCode } = req.body;

    if (process.env.NODE_ENV === "staging")
      throw new Error("Sign up not supported in staging");

    const count = await prisma.account.count();
    if (count > config.limit.maxAccounts) {
      throw new Error("RATE_LIMIT");
    }

    // hash password and store in db
    const passwordHash = await argon2.hash(password);
    const emailVerificationToken = v4();

    const account = await prisma.account.create({
      data: {
        email,
        passwordHash,
        emailVerificationToken,
        referralCode: referralCode || "",
      },
    });

    let customer: any = await stripe.customers.create({
      email: email,
      description: "Kalygo customer",
    });

    const role = await prisma.role.create({
      data: {
        type: RoleTypes.USER,
        accountId: account.id,
      },
    });

    // FREE CREDITS

    await prisma.summaryCredits.create({
      data: {
        accountId: account!.id,
        amount: 1,
      },
    });

    await prisma.vectorSearchCredits.create({
      data: {
        accountId: account!.id,
        amount: 1,
      },
    });

    await prisma.customRequestCredits.create({
      data: {
        accountId: account!.id,
        amount: 1,
      },
    });

    const emailConfig = generateVerifyEmail_SES_Config(
      email,
      `${process.env.FRONTEND_HOSTNAME}/verify-email?email=${email}&email-verification-token=${emailVerificationToken}`,
      req
      // `${process.env.FRONTEND_HOSTNAME}/verify-email`
    );
    await sesClient.send(new SendTemplatedEmailCommand(emailConfig));

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
