import { Request, Response, NextFunction } from "express";
import { encoding_for_model } from "@dqbd/tiktoken";
import * as fs from "fs";
import prisma from "@/db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import { OpenAI } from "@/clients/openai_client";

export async function getSummaryV3(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET getSummaryV3");

    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
    });

    console.log("account", account);
    console.log("req.params.id", req.params.id);

    const summary = await prisma.summaryV3.findFirst({
      where: {
        // @ts-ignore
        requesterId: account?.id,
        id: parseInt(req.params.id),
      },
      include: {
        Ratings: true,
        SummariesAndAccessGroups: {
          include: {
            accessGroup: true,
          },
        },
      },
    });

    if (summary) {
      res.status(200).json(summary || null);
    } else {
      res.status(404).send();
    }
  } catch (e) {
    next(e);
  }
}
