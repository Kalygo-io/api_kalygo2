import { Request, Response, NextFunction } from "express";
import { encoding_for_model } from "@dqbd/tiktoken";
import * as fs from "fs";
import prisma from "@/db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import { OpenAI } from "@/clients/openai_client";

export async function ratePrompt(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST rateCustomRequest");

    const promptId = req.params.id;
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
        Prompts: true,
      },
    });

    // -v-v- GUARD IF NO ACCOUNT FOUND -v-v-
    if (
      !account?.Prompts?.find((el) => {
        return el.id === Number.parseInt(promptId);
      })
    ) {
      res.status(401).send();
      return;
    }

    const ratingRecord = await prisma.rating.findFirst({
      where: {
        accountId: account!.id,
        promptId: Number.parseInt(promptId),
      },
    });

    if (ratingRecord) {
      await prisma.rating.update({
        where: {
          id: ratingRecord.id,
        },
        data: {
          rating,
          ratingMax,
        },
      });
    } else {
      await prisma.rating.create({
        data: {
          accountId: account!.id,
          promptId: Number.parseInt(promptId),
          ratingType: "Prompt",
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
