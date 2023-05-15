import { Request, Response, NextFunction } from "express";
// const { Account } = require("../../../db/models/Account");
import argon2 from "argon2";

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, resetPasswordToken, newPassword } = req.body;

    const result = false;
    // const result = await Account.findOne({
    //   email,
    //   resetPasswordToken,
    // });

    if (result) {
      // found record for email and resetPasswordToken
      // so generate the hash of the new password, store, and notify of success
      const passwordHash = await argon2.hash(newPassword);

      /*
      result.passwordHash = passwordHash;
      result.resetPasswordToken = null;
      */

      // await result.save();
      res.status(200).clearCookie("jwt").send();
    } else {
      res.status(404).clearCookie("jwt").send();
    }
  } catch (e) {
    next(e);
  }
}
