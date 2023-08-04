import { Request, Response, NextFunction } from "express";
import prisma from "@/db/prisma_client";
import { generateAccessToken } from "../../../../utils/index";
import { stripe } from "@/clients/stripe_client";
import { RoleTypes } from "@/types/RoleTypes";
import { OAuthClient } from "@/clients/oauth2_client";

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
    const tokenInfo = await OAuthClient.getTokenInfo(token);
    const email = tokenInfo?.email;
    const emailVerified = tokenInfo?.email_verified;
    // const firstName = tokenInfo?.given_name;
    // const lastName = tokenInfo?.family_name;

    if (email && emailVerified) {
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
          // firstName: firstName,
          // lastName: lastName,
          isGoogleAccount: true,
          emailVerified: true,
        },
      });
      await prisma.role.create({
        data: {
          type: RoleTypes.USER,
          accountId: account.id,
        },
      });
      // FREE CREDITS
      await prisma.summaryCredits.create({
        data: {
          accountId: account!.id,
          amount: 1,
        },
      });
      await prisma.vectorSearchCredits.create({
        data: {
          accountId: account!.id,
          amount: 1,
        },
      });
      await prisma.customRequestCredits.create({
        data: {
          accountId: account!.id,
          amount: 1,
        },
      });

      const jwt = generateAccessToken(email, [RoleTypes.USER]);
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
      throw new Error("Invalid Email");
    }
  } catch (e) {
    next(e);
  }
}
