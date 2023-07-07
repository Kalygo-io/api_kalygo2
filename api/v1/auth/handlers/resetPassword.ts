import { Request, Response, NextFunction } from "express";
import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import prisma from "@db/prisma_client";
import argon2 from "argon2";
import { generatePasswordUpdated_SES_Config } from "@emails/passwordUpdated";
import { sesClient } from "@/clients/ses_client";

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, resetPasswordToken, newPassword } = req.body;

    console.log(email, resetPasswordToken, newPassword);

    const result = await prisma.account.findFirst({
      where: {
        email,
        resetPasswordToken,
      },
    });

    if (result) {
      // found record for email and resetPasswordToken
      // so generate the hash of the new password, store, and notify of success
      const newPasswordHash = await argon2.hash(newPassword);

      const updatedAccount = await prisma.account.update({
        where: {
          email: email,
        },
        data: {
          passwordHash: newPasswordHash,
          resetPasswordToken: null,
        },
      });

      const emailConfig = generatePasswordUpdated_SES_Config(email, req);
      await sesClient.send(new SendTemplatedEmailCommand(emailConfig));

      res.status(200).clearCookie("jwt").send();
    } else {
      res.status(404).clearCookie("jwt").send();
    }
  } catch (e) {
    next(e);
  }
}
