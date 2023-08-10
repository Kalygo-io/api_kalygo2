import { Request, Response, NextFunction } from "express";
import { jobQueue } from "@/clients/bull_client";

export async function retryJob(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST retryJob", req.body.jobId);

    let queueJobs = await jobQueue.getJobs([
      "active",
      "waiting",
      "completed",
      "failed",
      "delayed",
      "paused",
    ]);

    const job = queueJobs.find((j) => {
      console.log("j", j);
      if (j.id === req.body.jobId) {
        return true;
      }
    });

    await job?.retry();
    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
