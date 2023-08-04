import { Request, Response, NextFunction } from "express";
import { encoding_for_model } from "@dqbd/tiktoken";
import * as fs from "fs";
import prisma from "@/db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import { OpenAI } from "@/clients/openai_client";

export async function getSummaryV2(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET getSummaryV2");

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    console.log("account", account);

    console.log("req.params.id", req.params.id);

    const summary = await prisma.summaryV2.findFirst({
      where: {
        // @ts-ignore
        requesterId: account?.id,
        id: parseInt(req.params.id),
      },
      include: {
        Ratings: true,
      },
    });

    console.log("account", account);
    console.log("summary", summary);

    if (summary) {
      res.status(200).json(summary || null);
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
