import { Request, Response, NextFunction } from "express";

import prisma from "@db/prisma_client";
import argon2 from "argon2";
import { v4 } from "uuid";

import { SESClient, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";

import { generateVerifyEmail_SES_Config } from "@emails/verifyEmail";

const REGION = process.env.REGION;
const sesClient = new SESClient({ region: REGION });

export async function signUp(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const count = await prisma.account.count();

    if (count > 200) {
      throw new Error("RATE_LIMIT");
    }

    // hash password and store in db
    const passwordHash = await argon2.hash(password);
    const emailVerificationToken = v4();

    const result = await prisma.account.create({
      data: {
        email,
        passwordHash,
        emailVerificationToken,
      },
    });

    const emailConfig = generateVerifyEmail_SES_Config(
      email,
      // `${process.env.FRONTEND_HOSTNAME}/verify-email/${emailVerificationToken}`
      `${process.env.FRONTEND_HOSTNAME}/verify-email`
    );
    await sesClient.send(new SendTemplatedEmailCommand(emailConfig));

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
