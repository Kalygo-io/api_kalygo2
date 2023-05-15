import { Request, Response, NextFunction } from "express";
// const { Account } = require("@db/models/Account");

export async function deleteAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // @ts-ignore
    const { email } = req.user;

    if (email) {
      //    const result = await Account.deleteOne({ email });
      /* TODO
        const { n, ok, deletedCount } = result;
        if (n === 1 && ok === 1 && deletedCount === 1) {
            res.status(200).clearCookie("jwt").send();
        } else {
            res.status(404).clearCookie("jwt").send();
        }
      */
    } else {
      res.status(401).clearCookie("jwt").send();
    }
  } catch (e) {
    next(e);
  }
}
