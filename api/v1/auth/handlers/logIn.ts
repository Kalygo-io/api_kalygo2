import { Request, Response, NextFunction } from "express";
import { generateAccessToken } from "@/utils";
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
    console.log("POST /v1/auth/log-in");

    const { email, password } = req.body;

    // const account = await Account.findOne({ email, verified: true });
    const account = await prisma.account.findFirst({
      where: {
        email,
        emailVerified: true,
        markAsDeleted: false,
      },
      include: {
        Roles: true,
      },
    });

    console.log("account", account);

    if (account) {
      const { passwordHash } = account;

      if (passwordHash && (await argon2.verify(passwordHash, password))) {
        console.log("before recording login");
        await prisma.login.create({
          data: {
            accountId: account.id,
          },
        });
        console.log("after recording login");

        const roles = account.Roles.map((role) => role.type);

        console.log("roles for accessToken", roles);

        const token = generateAccessToken(email, roles);

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
