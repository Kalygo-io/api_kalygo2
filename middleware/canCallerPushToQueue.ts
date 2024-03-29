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
      UsageCredits: true,
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
  // FIND EXISTING STRIPE CUSTOMER
  const customerSearchResults = await stripe.customers.search({
    // @ts-ignore
    query: `email:\'${account.email}\'`,
  });
  // -v-v- GUARD IF NO ACCOUNT FOUND -v-v-
  if (!customerSearchResults.data[0].id) {
    res.status(402).send();
    return;
  }

  // -v-v- GUARD IF NO CARD ATTACHED TO STRIPE ACCOUNT FOUND -v-v-
  // const stripeCustomer = await stripe.customers.retrieve(
  //   customerSearchResults.data[0].id
  // );

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

  console.log("DEBUG canCallerPushToQueue middleware...");

  let ACCOUNT_TOTAL_CHARGES_LIMIT;
  if (process.env.NODE_ENV === "development") {
    ACCOUNT_TOTAL_CHARGES_LIMIT = 40;
  } else {
    ACCOUNT_TOTAL_CHARGES_LIMIT = 40;
  }

  console.log("activeJobs.length", activeJobs.length);
  // console.log("stripeCustomer.default_source", stripeCustomer.default_source);
  console.log("req.body", req.body);
  console.log("account?.SummaryCredits", account?.SummaryCredits);
  console.log("account?.VectorSearchCredits", account?.VectorSearchCredits);
  console.log("account?.CustomRequestCredits", account?.CustomRequestCredits);
  console.log("account?.UsageCredits", account?.UsageCredits?.amount);
  console.log(
    `totalCharges < ${ACCOUNT_TOTAL_CHARGES_LIMIT}`,
    totalCharges < ACCOUNT_TOTAL_CHARGES_LIMIT
  );

  if (activeJobs.length > 10) {
    res.status(429).send();
    return;
  }

  if (
    totalCharges < ACCOUNT_TOTAL_CHARGES_LIMIT &&
    ((account?.UsageCredits?.amount || 0) > 0 ||
      ((account?.UsageCredits?.amount || 0) <= 0 &&
        req.body.model === "gpt-3.5-turbo" &&
        (account?.SummaryCredits?.amount ||
          account?.VectorSearchCredits?.amount ||
          account?.CustomRequestCredits?.amount)))
  ) {
    console.log("CAN push to queue");
    next();
  } else {
    console.log("CANNOT push to queue");
    res.status(403).send();
  }
}
