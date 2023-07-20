import { Request, Response, NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import prisma from "@/db/prisma_client";
import { generateAccessToken } from "../../../../utils/index";

const client = new OAuth2Client(
  "228661221561-fji8mvq01479i2tnr4n3qdcg74b3duad.apps.googleusercontent.com", // env when fully working
  "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"
);

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
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:
        "228661221561-fji8mvq01479i2tnr4n3qdcg74b3duad.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();

    if (payload) {
      const email = payload["email"];

      if (typeof email === "string") {
        const user = await prisma.account.findUnique({
          where: {
            email: email,
          },
          include: {
            Roles: true,
          },
        });

        if (user) {
          if (!user.isGoogleAccount) {
            throw new Error("Not a google account");
          }
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
        throw new Error("Email not provided");
      }
    }
  } catch (e) {
    next(e);
    //@ts-ignore
    res.status(500).send(e.message);
    console.error("An error occurred: ", e);
  }
}
