import { Request, Response, NextFunction } from "express";

// import prisma from "@db/prisma_client";

export async function summarize(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("--- upload controller ---");

    console.log(req.file);

    // // @ts-ignore
    // let { email } = req.user;

    // const result = await prisma.account.findFirst({
    //   where: {
    //     email,
    //   },
    // });

    // if (result) {
    res.status(200).send();
    // } else {
    //   res.status(404).send();
    // }
  } catch (e) {
    next(e);
  }
}
