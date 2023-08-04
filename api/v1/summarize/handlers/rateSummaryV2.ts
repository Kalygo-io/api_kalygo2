import { Request, Response, NextFunction } from "express";
import { encoding_for_model } from "@dqbd/tiktoken";
import * as fs from "fs";
import prisma from "@/db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import { OpenAI } from "@/clients/openai_client";

export async function rateSummaryV2(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST rateSummaryV2");

    const summaryV2Id = req.params.id;
    const { rating, ratingMax } = req.body;

    // @ts-ignore
    let email = req.user.email;
    const account = await prisma.account.findFirst({
      where: {
        email: email,
        emailVerified: true,
      },
      include: {
        SummaryCredits: true,
        Ratings: true,
      },
    });

    // -v-v- GUARD IF NO ACCOUNT FOUND -v-v-
    if (
      !account?.Ratings?.find((el) => {
        return el.accountId === account.id;
      })
    ) {
      res.status(401).send();
      return;
    }

    console.log("account", account);

    const ratingRecord = await prisma.rating.findFirst({
      where: {
        accountId: account!.id,
        summaryV2Id: Number.parseInt(summaryV2Id),
      },
    });

    if (ratingRecord) {
      const updatedRating = await prisma.rating.update({
        where: {
          id: ratingRecord.id,
        },
        data: {
          rating,
          ratingMax,
        },
      });
    } else {
      const newRating = await prisma.rating.create({
        data: {
          accountId: account!.id,
          summaryV2Id: Number.parseInt(summaryV2Id),
          ratingType: "SummaryV2",
          rating,
          ratingMax,
        },
      });
    }

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
