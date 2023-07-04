import { Request, Response, NextFunction } from "express";
import { jobQueue } from "@/clients/bull_client";
import { encoding_for_model } from "@dqbd/tiktoken";

export async function clearQueue(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST clearQueue");
    await jobQueue.removeJobs("*");
    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
