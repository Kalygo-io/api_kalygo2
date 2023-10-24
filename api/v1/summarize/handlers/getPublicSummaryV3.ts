import { Request, Response, NextFunction } from "express";
import { encoding_for_model } from "@dqbd/tiktoken";
import * as fs from "fs";
import prisma from "@/db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import { OpenAI } from "@/clients/openai_client";

export async function getPublicSummaryV3(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET getPublicSummaryV3");

    const summary = await prisma.summaryV3.findFirst({
      where: {
        id: parseInt(req.params.id),
      },
      include: {
        Ratings: true,
        SummaryV3sAndAccessGroups: {
          include: {
            accessGroup: true,
          },
        },
      },
    });

    console.log("summary", summary);

    if (summary) {
      res.status(200).json(summary || null);
    } else {
      res.status(404).send();
    }
  } catch (e) {
    console.log("ERROR in getPublicSummaryV3", e);

    next(e);
  }
}
