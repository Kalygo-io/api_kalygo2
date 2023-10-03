import { jobQueue } from "@/clients/bull_client";
import { Request, Response, NextFunction } from "express";
import { QueueJobTypes } from "@/types/JobTypes";

export async function getFiles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST get-files");
    // console.log("req.body.customPrompt", req.body.customPrompt);
    // console.log("req.files", req.files as any);

    let language: string = req?.i18n?.language?.substring(0, 2) || "en";

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
