import { Request, Response, NextFunction } from "express";

// const { Account } = require("@db/models/Account");

import { SESClient, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { v4 } from "uuid";

const REGION = process.env.AWS_REGION;
import { generateResetPassword_SES_Config } from "@emails/resetPassword";

const sesClient = new SESClient({ region: REGION });

export async function mockRequestPasswordReset(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!process.env.MOCK_PASSWORD_RESET) res.status(401).send();

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
      const RESET_LINK = `${process.env.FRONTEND_DOMAIN}/resetPassword/${UUID}`;

      res.status(200).json({
        resetToken: UUID,
        resetLink: RESET_LINK,
      });
    } else res.status(404).send();
  } catch (e) {
    next(e);
  }
}
