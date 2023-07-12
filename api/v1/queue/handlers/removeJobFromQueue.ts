import { Request, Response, NextFunction } from "express";
import { jobQueue } from "@/clients/bull_client";
import { encoding_for_model } from "@dqbd/tiktoken";

export async function removeJobFromQueue(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("DELETE removeJobFromQueue", req.body.jobId);
    await jobQueue.removeJobs(req.body.jobId);
    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
