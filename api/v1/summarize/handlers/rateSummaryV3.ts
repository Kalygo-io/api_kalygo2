import { Request, Response, NextFunction } from "express";
import { encoding_for_model } from "@dqbd/tiktoken";
import * as fs from "fs";
import prisma from "@/db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import { OpenAI } from "@/clients/openai_client";

export async function rateSummaryV3(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST rateSummaryV3");

    const summaryV3Id = req.params.id;
    const { rating, ratingMax } = req.body;

    // @ts-ignore
    let email = req.user.email;
    const account = await prisma.account.findFirst({
      where: {
        email: email,
        emailVerified: true,
      },
      include: {
        Ratings: true,
        SummaryV3: true,
      },
    });

    // -v-v- GUARD IF NO ACCOUNT FOUND -v-v-
    if (
      !account?.SummaryV3?.find((el) => {
        return el.id === Number.parseInt(summaryV3Id);
      })
    ) {
      res.status(401).send();
      return;
    }

    console.log("account", account);

    const ratingRecord = await prisma.rating.findFirst({
      where: {
        accountId: account!.id,
        summaryV3Id: Number.parseInt(summaryV3Id),
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
          summaryV3Id: Number.parseInt(summaryV3Id),
          ratingType: "SummaryV3",
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
