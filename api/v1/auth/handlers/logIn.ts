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

    // const result = await Account.findOne({ email, verified: true });
    const result = await prisma.account.findFirst({
      where: {
        email,
        emailVerified: true,
      },
    });

    if (result) {
      const { passwordHash } = result;

      if (await argon2.verify(passwordHash, password)) {
        const token = generateAccessToken(email);

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
