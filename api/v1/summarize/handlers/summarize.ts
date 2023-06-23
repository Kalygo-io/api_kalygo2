import { Request, Response, NextFunction } from "express";
import { encoding_for_model } from "@dqbd/tiktoken";
import * as fs from "fs";
import prisma from "@/db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import { OpenAI } from "@/clients/openai_client";
import { summarizationJobQueue } from "@/clients/bull_client";

const enc = encoding_for_model("gpt-3.5-turbo");

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPartsValid(parts: string[]): boolean {
  for (let i = 0; i < parts.length; i++) {
    if (enc.encode(parts[i]).length > 4096) return false;
  }

  return true;
}

const PROMPT_PREFIX = (
  lng: string
) => `Please provide a detailed summary of the following ORIGINAL_TEXT
            
The summary should be:

- Written in ${lng}
- Grammatically correct
- Have professional punctuation
- Be accurate
- In cases where accuracy is not possible please provide a disclaimer
      
Here is the ORIGINAL_TEXT:`;

export async function summarize(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST summarize");
    // console.log("req.body", req.body);

    summarizationJobQueue.add({
      bucket: "kalygo-documents",
      key: req.body.filePath,
    });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
