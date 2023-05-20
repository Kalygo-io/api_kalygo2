import { Request, Response, NextFunction } from "express";

// import { Account } from "@db/models/Account";
import argon2 from "argon2";
import prisma from "@db/prisma_client";

export async function isAuthed(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("_!_ _!_");

    res.status(200).send();

    // @ts-ignore
    // let { email } = req.user;

    // const result = await prisma.account.findFirst({
    //   where: {
    //     email,
    //   },
    // });

    // if (result) {
    //   res.status(200).send();
    // } else {
    //   res.status(404).send();
    // }
  } catch (e) {
    next(e);
  }
}
