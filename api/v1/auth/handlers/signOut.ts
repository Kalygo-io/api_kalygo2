import express, { Request, Response, NextFunction } from "express";

// const { Account } = require("../../../db/models/Account");

export async function signOut(req: Request, res: Response, next: NextFunction) {
  try {
    // @ts-ignore
    let { email } = req.user;

    // const result = await Account.findOne({
    //   email,
    // });

    let result = false;

    if (result) {
      res.status(200).clearCookie("jwt").send();
    } else res.status(404).clearCookie("jwt").send();
  } catch (e) {
    next(e);
  }
}
