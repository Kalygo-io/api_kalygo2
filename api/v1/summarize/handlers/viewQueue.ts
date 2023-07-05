import { Request, Response, NextFunction } from "express";
import { jobQueue } from "@/clients/bull_client";
import { encoding_for_model } from "@dqbd/tiktoken";

export async function viewQueue(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET viewQueue");

    let activeJobs = await jobQueue.getJobs([
      "active",
      "waiting",
      "completed",
      "failed",
    ]);

    console.log("activeJobs", activeJobs);

    activeJobs = activeJobs.filter((i) => {
      // @ts-ignore
      return i?.data?.params?.email === req?.user?.email;
    });

    res.status(200).send({
      activeJobs,
    });
  } catch (e) {
    next(e);
  }
}
