import { stripe } from "@/clients/stripe_client";
import prisma from "@/db/prisma_client";

export async function guard_beforeRunningSummary(
  email: string,
  model: "gpt-3.5-turbo" | "gpt-4"
) {
  // -v-v- CHECK IF CALLER HAS AN ACCOUNT -v-v-
  const account = await prisma.account.findFirst({
    where: {
      email: email,
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

  const stripeCustomer = await stripe.customers.retrieve(account.stripeId);
  const summaryCredits = account?.SummaryCredits?.amount;
  if (
    (!stripeCustomer.default_source && model === "gpt-4" && summaryCredits) ||
    (!stripeCustomer.default_source && !summaryCredits)
  ) {
    throw new Error("402");
  }

  return account;
}
