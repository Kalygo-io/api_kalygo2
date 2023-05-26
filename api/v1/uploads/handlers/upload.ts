import { Request, Response, NextFunction } from "express";

// import prisma from "@db/prisma_client";

export async function upload(req: Request, res: Response, next: NextFunction) {
  try {
    // // @ts-ignore
    // let { email } = req.user;

    // const result = await prisma.account.findFirst({
    //   where: {
    //     email,
    //   },
    // });

    // if (result) {
    res.status(500).send();
    // } else {
    //   res.status(404).send();
    // }
  } catch (e) {
    next(e);
  }
}
