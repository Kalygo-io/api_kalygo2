import { Request, Response, NextFunction } from "express";

// import { Account } from "@db/models/Account";

export async function clearAccounts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!process.env.MOCK_DATABASE) res.status(401).send();

    // await Account.deleteMany({});

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
