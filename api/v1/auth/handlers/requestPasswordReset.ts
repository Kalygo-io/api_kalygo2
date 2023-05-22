import { Request, Response, NextFunction } from "express";
import { SESClient, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { nanoid } from "nanoid";
import prisma from "@db/prisma_client";

import { generateResetPassword_SES_Config } from "@emails/resetPassword";

const REGION = process.env.REGION;
const sesClient = new SESClient({ region: REGION });

export async function requestPasswordReset(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body;

    const result = await prisma.account.findFirst({
      where: {
        email,
      },
    });

    console.log("result", result);

    if (result) {
      // generate the reset password token
      const UUID = nanoid(10);

      const updatedAccount = await prisma.account.update({
        where: {
          email: email,
        },
        data: {
          resetPasswordToken: UUID,
        },
      });

      const RESET_LINK = `${process.env.FRONTEND_HOSTNAME}/reset-password?email=${email}`;
      // and send the email
      const emailConfig = generateResetPassword_SES_Config(
        email,
        RESET_LINK,
        UUID
      );
      await sesClient.send(new SendTemplatedEmailCommand(emailConfig));
      res.status(200).send();
    } else res.status(404).send();
  } catch (e) {
    next(e);
  }
}
