import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";
import { generateAccessToken } from "../../../../utils/index";
import { OAuthClient } from "@/clients/oauth2_client";

export async function googleLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error("No auth header");
    }
    const token = authHeader?.split(" ")[1];
    const tokenInfo = await OAuthClient.getTokenInfo(token);
    const email = tokenInfo?.email;
    const emailVerified = tokenInfo?.email_verified;

    // const token = authHeader?.split(" ")[1];
    // const ticket = await OAuthClient.verifyIdToken({
    //   idToken: token,
    // });
    // const payload = ticket.getPayload();
    // const email = payload?.email;

    if (email && emailVerified) {
      const user = await prisma.account.findUnique({
        where: {
          email: email,
        },
        include: {
          Roles: true,
        },
      });

      if (user) {
        const roles = user.Roles.map((role) => role.type);
        const jwt = generateAccessToken(email, roles);
        res
          .status(200)
          .cookie("jwt", jwt, {
            sameSite: "strict",
            path: "/",
            expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 1),
            httpOnly: true,
            secure: true,
          })
          .send();
      } else {
        res.status(404).send();
      }
    } else {
      throw new Error("Invalid Email");
    }
  } catch (e) {
    next(e);
    //@ts-ignore
    res.status(500).send(e.message);
    console.error("An error occurred: ", e);
  }
}
