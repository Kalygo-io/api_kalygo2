import { Request, Response, NextFunction } from "express";
import { generateAccessToken } from "../../../../utils/index";
import prisma from "@db/prisma_client";
const argon2 = require("argon2");

export async function logIn(
  req: Request<
    null,
    null,
    {
      email: string;
      password: string;
    }
  >,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body;
    const adminEmails = [ 'jstudyeth@gmail.com', 'tad@cmdlabs.io', 'sebaspindu@gmail.com', 'laurenseff@gmail.com', 'joseph.12082@gmail.com'];

    // const account = await Account.findOne({ email, verified: true });
    const account = await prisma.account.findFirst({
      where: {
        email,
        emailVerified: true,
        markAsDeleted: false,
      },
    });

    if (account) {
      const { passwordHash } = account;

      if (await argon2.verify(passwordHash, password)) {
        console.log("before recording login");
        await prisma.login.create({
          data: {
            accountId: account.id,
          },
        });
        console.log("after recording login");

        const role = adminEmails.includes(email) ? 'admin' : 'user';

        const token = generateAccessToken(email, role);

        res
          .status(200)
          .cookie("jwt", token, {
            sameSite: "strict",
            path: "/",
            expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 1),
            httpOnly: true,
            secure: true,
          })
          .send();
      } else res.status(401).send();
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
