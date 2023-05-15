import { Request, Response, NextFunction } from "express";

// import { Account } from "@db/models/Account";
import argon2 from "argon2";

export async function isAuthed(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // @ts-ignore
    let { email } = req.user;

    // const result = await Account.findOne({
    //   email,
    // });
    const result = false;

    if (result) {
      res.status(200).send();
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
