import { jobQueue } from "@/clients/bull_client";
import { stripe } from "@/clients/stripe_client";
import prisma from "@/db/prisma_client";
import { NextFunction, Request, Response } from "express";

export async function isJobCreator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("Is caller the creator of the job they are attempting to retry?");
  let queueJobs = await jobQueue.getJobs([
    "active",
    "waiting",
    "completed",
    "failed",
    "delayed",
    "paused",
  ]);
  console.log("here");

  const job = queueJobs.find((j) => {
    console.log("j", j);
    if (j.id === req.body.jobId) {
      return true;
    }
  });
  console.log(job, "here here");
  // @ts-ignore
  if (job?.data?.params?.email === req?.user?.email) {
    console.log("Yes, they are √");
    next();
  } else {
    console.log("No, they aren't X");
    res.status(403).send();
  }
}
