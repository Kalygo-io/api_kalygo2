import prisma from "@db/prisma_client";
import pick from "lodash.pick";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";
import {
  GetSecretValueCommand,
  secretsManagerClient,
} from "@/clients/aws_secrets_manager_client";

export async function getBatchOfJobs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("GET /api/v1/get-batch-of-jobs");

    const batchId = req.params.id;

    console.log("---> batchId <---", batchId);

    // fetch account by email
    let account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
      },
      include: {
        AccessGroups: true,
      },
    });

    console.log("account?.id", account?.id);

    const summaryV3InBatch = await prisma.summaryV3.findMany({
      where: {
        requesterId: account?.id,
        batchId: batchId,
      },
    });

    res.status(200).json({ summaryV3: summaryV3InBatch });
  } catch (e) {
    next(e);
  }
}
