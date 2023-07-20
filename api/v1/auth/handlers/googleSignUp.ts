import { Request, Response, NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import prisma from "@/db/prisma_client";
import { generateAccessToken } from "../../../../utils/index";
import { stripe } from "@/clients/stripe_client";
import { RoleTypes } from "@/types/RoleTypes";

const client = new OAuth2Client(
  "228661221561-fji8mvq01479i2tnr4n3qdcg74b3duad.apps.googleusercontent.com", // env when fully working
  "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"
);

export async function googleSignUp(
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
      const firstName = payload["given_name"];
      const lastName = payload["family_name"];

      if (typeof email === "string") {
        let user = await prisma.account.findUnique({
          where: {
            email: email,
          },
          include: {
            Roles: true,
          },
        });

        if (user) {
          throw new Error("An account with this email already exists");
        } else {
          // if there is no user in the DB associated with the gmail of google sign in
          const customer: any = await stripe.customers.create({
            // @ts-ignore
            email: email,
            description: "Kalygo customer",
          });
          const account = await prisma.account.create({
            data: {
              email,
              stripeId: customer.id,
              firstName: firstName,
              lastName: lastName,
              isGoogleAccount: true,
            },
          });
          const role = await prisma.role.create({
            data: {
              type: RoleTypes.USER,
              accountId: account.id,
            },
          });
          // FREE CREDITS
          await prisma.summaryCredits.create({
            data: {
              accountId: account!.id,
              amount: 2,
            },
          });
          await prisma.vectorSearchCredits.create({
            data: {
              accountId: account!.id,
              amount: 2,
            },
          });
        }
        user = await prisma.account.findUnique({
          where: { email },
          include: { Roles: true },
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
        }
      }
    } else {
      throw new Error("Email not provided");
    }
  } catch (e) {
    next(e);
    //@ts-ignore
    res.status(500).send(e.message);
    console.error("An error occurred: ", e);
  }
}
