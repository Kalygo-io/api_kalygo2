import { Request, Response, NextFunction } from "express";
// const { Account } = require("@db/models/Account");
import { SESClient, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { v4 } from "uuid";

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
    // const result = await Account.findOne({ email });
    const result = false;

    if (result) {
      // generate the reset password token
      const UUID = v4();
      /*
        result.resetPasswordToken = UUID;
        await result.save();
      */
      const RESET_LINK = `${process.env.FRONTEND_HOSTNAME}/resetPassword/${UUID}`;
      // and send the email
      const emailConfig = generateResetPassword_SES_Config(email, RESET_LINK);
      await sesClient.send(new SendTemplatedEmailCommand(emailConfig));
      res.status(200).send();
    } else res.status(404).send();
  } catch (e) {
    next(e);
  }
}
