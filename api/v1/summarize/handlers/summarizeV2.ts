import { Request, Response, NextFunction } from "express";
import { jobQueue } from "@/clients/bull_client";
import { QueueJobTypes } from "@/types/JobTypes";
import { PrismaClient } from "@prisma/client";
import { stripe } from "@/clients/stripe_client";
const prisma = new PrismaClient();

export async function summarizeV2(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST summarizeV2");
    console.log("req.files", req.files);
    console.log("req.body", req.body);
    let locale: string = req?.i18n?.language?.substring(0, 2) || "en";

    const userOpenAiCharges = await prisma.openAiCharges.findMany({
      where: {
        // @ts-ignore
        accountId: req.user.id,
      },
    });
    let totalCharges = userOpenAiCharges.reduce(
      (total, charge) => total + charge.amount,
      0
    );
    if (totalCharges > 5) {
      res.status(403).json({ error: "You have exceeded the limit" });
      return;
    }
    const account = await prisma.account.findFirst({
      where: {
        // @ts-ignore
        email: req.user.email,
        emailVerified: true,
      },
      include: {
        SummaryCredits: true,
      },
    });
    // -v-v- GUARD IF NO ACCOUNT FOUND -v-v-
    if (!account?.stripeId) {
      throw new Error("402");
    }
    // -v-v- GUARD IF NO CARD ATTACHED TO STRIPE ACCOUNT FOUND -v-v-
    const stripeCustomer = await stripe.customers.retrieve(account.stripeId);
    if (
      (!stripeCustomer.default_source &&
        req.body.model === "gpt-4" &&
        account.SummaryCredits?.amount) ||
      (!stripeCustomer.default_source && !account.SummaryCredits?.amount)
    ) {
      throw new Error("402");
    }

    let activeJobs = await jobQueue.getJobs([
      "active",
      "waiting",
      "completed",
      "failed",
    ]);

    activeJobs = activeJobs.filter((i) => {
      // @ts-ignore
      return i?.data?.params?.email === req?.user?.email;
    });

    if (activeJobs.length > 5) {
      throw new Error("429");
    }

    jobQueue.add(
      {
        jobType: QueueJobTypes.SummaryV2,
        params: {
          bucket: process.env.S3_DOCUMENTS_BUCKET,
          files: req.files,
          customizations: {
            format: req.body.format,
            mode: req.body.mode,
            length: req.body.length,
            language: req.body.language,
            model: req.body.model,
          },
          // @ts-ignore
          email: req.user.email,
          locale,
        },
      },
      {
        timeout: 1000 * 60 * 60, // 1 hour before being marked as timed out
      }
    );

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
