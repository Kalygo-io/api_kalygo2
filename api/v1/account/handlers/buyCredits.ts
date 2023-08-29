import { Request, Response, NextFunction } from "express";
import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import argon2 from "argon2";
import { v4 } from "uuid";

import { SendTemplatedEmailCommand } from "@aws-sdk/client-ses";

import { sesClient } from "@/clients/ses_client";
import config from "@/config";
import { calculateTotal } from "@/config/calculatePricing";
import { purchasedCreditsEmail_SES_Config } from "@/emails/v1/purchasedCredits";

export async function buyCredits(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("req.body", req.body);
    const {
      card: { exp_month, exp_year, card_number, cvc, name },
      credits,
    } = req.body;
    const count = await prisma.account.count();
    if (count > config.limit.maxAccounts) {
      throw new Error("RATE_LIMIT");
    }
    // give caller's account
    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
      include: {
        UsageCredits: true,
      },
    });
    // FIND EXISTING STRIPE CUSTOMER --- STEP
    const customerSearchResults = await stripe.customers.search({
      // @ts-ignore
      query: `email:\'${req.user.email}\'`,
    });
    const total: any = calculateTotal(credits); // total to charge to the caller's card
    if (customerSearchResults.data[0]) {
      // IF STRIPE CUSTOMER EXISTS
      /* ADD CARD IF NEEDED */ // --- STEP
      if (customerSearchResults?.data[0]?.default_source) {
        // prettier-ignore
        await stripe.charges.create({ // --- STEP
          amount: Math.floor(total * 100), // '* 100' is because Stripe goes by pennies
          currency: "usd",
          description: `Purchasing ${credits} usage credits`,
          customer: customerSearchResults.data[0].id,
        });
        // record the usage credits in the db
        await prisma.usageCredits.upsert({
          where: {
            accountId: account?.id,
          },
          update: {
            amount: (account?.UsageCredits?.amount || 0) + credits,
          },
          // @ts-ignore
          create: {
            accountId: account?.id,
            amount: credits,
          },
        });
      } else {
        const addCardStripeResp = await stripe.customers.createSource(
          customerSearchResults.data[0].id,
          {
            source: {
              object: "card",
              exp_month,
              exp_year,
              number: card_number,
              cvc,
              name,
            },
          }
        );
        console.log("addCardStripeResp", addCardStripeResp);
        // prettier-ignore
        await stripe.charges.create({ // --- STEP
          amount: Math.floor(total * 100), // '* 100' is because Stripe goes by pennies
          currency: "usd",
          description: `Purchasing ${credits} usage credits`,
          customer: customerSearchResults.data[0].id,
        });
        console.log("adding credits to balance", account);
        // record the usage credits in the db
        await prisma.usageCredits.upsert({
          where: {
            accountId: account?.id,
          },
          update: {
            amount: (account?.UsageCredits?.amount || 0) + credits,
          },
          // @ts-ignore
          create: {
            accountId: account?.id,
            amount: credits,
          },
        });
        await stripe.customers.deleteSource(
          customerSearchResults.data[0].id,
          addCardStripeResp.id
        );
      }
    } else {
      const newCustomer: any = await stripe.customers.create({
        // @ts-ignore
        email: req.user.email,
        description: "Kalygo customer",
      });
      console.log("newCustomer object in Stripe created successfully...");
      /* ADD CARD */
      const addCardStripeResp = await stripe.customers.createSource(
        newCustomer.id,
        {
          source: {
            object: "card",
            exp_month: req.body.exp_month,
            exp_year: req.body.exp_year,
            number: req.body.card_number,
            cvc: req.body.cvc,
          },
        }
      );
      await stripe.charges.create({
        // --- STEP
        amount: Math.floor(total * 100), // '* 100' is because Stripe goes by pennies
        currency: "usd",
        description: `Purchasing ${credits} usage credits`,
        customer: customerSearchResults.data[0].id,
      });
      console.log("adding credits to balance", account);
      // record the usage credits in the db
      await prisma.usageCredits.upsert({
        where: {
          accountId: account?.id,
        },
        update: {
          amount: (account?.UsageCredits?.amount || 0) + credits,
        },
        // @ts-ignore
        create: {
          accountId: account?.id,
          amount: credits,
        },
      });
      await stripe.customers.deleteSource(
        customerSearchResults.data[0].id,
        addCardStripeResp.id
      );
    }

    const emailConfig = purchasedCreditsEmail_SES_Config(
      account?.email!,
      credits,
      req
    );
    await sesClient.send(new SendTemplatedEmailCommand(emailConfig));

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
