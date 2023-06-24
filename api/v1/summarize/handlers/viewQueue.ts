import { Request, Response, NextFunction } from "express";
import { summarizationJobQueue } from "@/clients/bull_client";
import { encoding_for_model } from "@dqbd/tiktoken";

export async function viewQueue(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET viewQueue");

    const activeJobs = await summarizationJobQueue.getJobs([]);

    console.log("activeJobs", activeJobs);

    res.status(200).send({
      activeJobs,
    });
  } catch (e) {
    next(e);
  }
}
