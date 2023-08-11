import { stripe } from "@/clients/stripe_client";
import prisma from "@/db/prisma_client";

export async function guard_beforeRunningSearch(
  email: string,
  model: "text-embedding-ada-002"
) {
  // -v-v- CHECK IF CALLER HAS AN ACCOUNT -v-v-
  const account = await prisma.account.findFirst({
    where: {
      email: email,
      emailVerified: true,
    },
    include: {
      VectorSearchCredits: true,
    },
  });
  // -v-v- GUARD IF NO ACCOUNT FOUND -v-v-
  if (!account?.stripeId) {
    throw new Error("402");
  }

  const stripeCustomer = await stripe.customers.retrieve(account.stripeId);
  const vectorSearchCredits = account?.VectorSearchCredits?.amount;
  if (
    (!stripeCustomer.default_source &&
      model === "text-embedding-ada-002" &&
      vectorSearchCredits) ||
    (!stripeCustomer.default_source && !vectorSearchCredits)
  ) {
    throw new Error("402");
  }

  return account;
}
