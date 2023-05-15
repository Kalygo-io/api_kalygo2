import { Request, Response, NextFunction } from "express";

// import { Account } from "@db/models/Account";

export async function verifyAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let { email, verificationToken } = req.body;

    // const result = await Account.findOne({
    //   email,
    //   verificationToken,
    // });
    const result = false;

    if (result) {
      /*
      result.verified = true;
      result.verificationToken = null;
      await result.save();
      */

      res.status(200).send();
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
