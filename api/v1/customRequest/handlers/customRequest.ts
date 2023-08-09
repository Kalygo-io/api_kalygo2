import prisma from "@db/prisma_client";
import { stripe } from "@/clients/stripe_client";
import pick from "lodash.pick";
import { jobQueue } from "@/clients/bull_client";
import { Request, Response, NextFunction } from "express";
import get from "lodash.get";
import { QueueJobTypes } from "@/types/JobTypes";

export async function customRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("POST custom-request");

    console.log("req.body.customPrompt", req.body.customPrompt);
    console.log("req.files", req.files as any);

    let language: string = req?.i18n?.language?.substring(0, 2) || "en";

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
        CustomRequestCredits: true,
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
        account.CustomRequestCredits?.amount) ||
      (!stripeCustomer.default_source && !account.CustomRequestCredits?.amount)
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
        jobType: QueueJobTypes.CustomRequest,
        params: {
          bucket: process.env.S3_DOCUMENTS_BUCKET,
          files: req.files,
          customPrompt: req.body.customPrompt,
          // @ts-ignore
          email: req.user.email,
          language: language,
        },
      },
      {
        timeout: 600000,
      }
    );

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}
