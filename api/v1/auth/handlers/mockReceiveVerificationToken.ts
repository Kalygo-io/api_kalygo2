import { Request, Response, NextFunction } from "express";

// import { Account } from "@db/models/Account";

export async function mockReceiveVerificationToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!process.env.MOCK_ACCOUNT_VERIFICATION) res.status(401).send();

    let { email } = req.body;

    // const result = await Account.findOne({
    //   email,
    // });

    const result = false;

    if (result) {
      res.status(200).send("TODO");
      //   res.status(200).send(result.verificationToken);
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
