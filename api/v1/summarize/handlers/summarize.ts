import { Request, Response, NextFunction } from "express";
import { summarizationJobQueue } from "@/clients/bull_client";
import { encoding_for_model } from "@dqbd/tiktoken";

export async function summarize(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST summarize");
    console.log("req.body", req.body);

    let language: string = req?.i18n?.language?.substring(0, 2) || "en";

    switch (language) {
      case "en":
        language = "English";
        break;
      case "es":
        language = "Spanish";
        break;
      default:
        language = "English";
    }

    for (let i of req.body.files) {
      console.log("<- i ->", i);

      summarizationJobQueue.add(
        {
          bucket: "kalygo-documents",
          key: i.key,
          originalName: i.originalName,
          language: language,
          // @ts-ignore
          email: req.user.email,
        },
        {
          timeout: 600000,
        }
      );
    }

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
