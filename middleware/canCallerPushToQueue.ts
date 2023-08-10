import { jobQueue } from "@/clients/bull_client";
import { stripe } from "@/clients/stripe_client";
import prisma from "@/db/prisma_client";
import { NextFunction, Request, Response } from "express";

export default async function canCallerPushToQueue(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("Can caller push to queue?");
  const account = await prisma.account.findFirst({
    where: {
      // @ts-ignore
      email: req.user.email,
      emailVerified: true,
    },
    include: {
      SummaryCredits: true,
      VectorSearchCredits: true,
      CustomRequestCredits: true,
    },
  });
  const userOpenAiCharges = await prisma.openAiCharges.findMany({
    where: {
      // @ts-ignore
      accountId: account.id,
    },
  });
  let totalCharges = userOpenAiCharges.reduce(
    (total, charge) => total + charge.amount,
    0
  );
  // -v-v- GUARD IF NO ACCOUNT FOUND -v-v-
  if (!account?.stripeId) {
    throw new Error("402");
  }
  // -v-v- GUARD IF NO CARD ATTACHED TO STRIPE ACCOUNT FOUND -v-v-
  const stripeCustomer = await stripe.customers.retrieve(account.stripeId);
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

  if (
    totalCharges < 5 &&
    activeJobs.length < 5 &&
    (stripeCustomer.default_source ||
      (!stripeCustomer.default_source &&
        req.body.model === "gpt-3.5-turbo" &&
        ((account?.SummaryCredits && account?.SummaryCredits?.amount > 0) ||
          (account?.VectorSearchCredits &&
            account?.VectorSearchCredits?.amount > 0) ||
          (account?.CustomRequestCredits &&
            account?.CustomRequestCredits?.amount > 0))))
  ) {
    console.log("CAN push to queue");
    next();
  } else {
    console.log("CANNOT push to queue");
    res.status(403).send();
  }
}
