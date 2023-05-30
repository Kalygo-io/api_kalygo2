import { Request, Response, NextFunction } from "express";
import { get_encoding, encoding_for_model } from "@dqbd/tiktoken";
import * as fs from "fs";
const enc = encoding_for_model("gpt-3.5-turbo");

export async function getSummarizationQuote(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const text = fs.readFileSync(`${req.file?.path}`, "utf8");

    const tokenCount = enc.encode(text).length;

    const apiCost = (tokenCount / 1000) * 0.002; // gpt-3.5-turbo cost
    const markup = 1.4; // 40%

    const quote = Number.parseFloat(
      (apiCost * markup > 0.5 ? apiCost * markup : 0.5).toFixed(2)
    );

    res.status(200).json({
      quote: quote.toFixed(2),
      filePath: `${req.file?.path}`,
    });
  } catch (e) {
    next(e);
  }
}

// const resp = completion.data?.choices[0]?.message?.content;
// gpt-3.5-turbo $0.002 / 1K tokens
// gpt-3.5-turbo 90,000 TPM
// gpt-3.5-turbo token limit per request is 4096 tokens
// 2171 / 1000 = 2.1 x 0.002 = $0.004?
