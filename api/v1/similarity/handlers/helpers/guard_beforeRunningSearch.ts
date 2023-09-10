import { stripe } from "@/clients/stripe_client";
import config from "@/config";
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
      UsageCredits: true,
    },
  });
  // -v-v- GUARD IF NO ACCOUNT FOUND -v-v-
  // prettier-ignore
  const customerSearchResults = await stripe.customers.search({ // FIND EXISTING STRIPE CUSTOMER
    query: `email:\'${email}\'`,
  });
  console.log(
    "customerSearchResults.data[0].id",
    customerSearchResults.data[0].id
  );
  // prettier-ignore
  const vectorSearchCredits = account?.VectorSearchCredits?.amount || 0;

  console.log("vectorSearchCredits", vectorSearchCredits);

  if (
    customerSearchResults.data[0].id &&
    (vectorSearchCredits > 0 ||
      account?.UsageCredits?.amount! >
        config.models["text-embedding-ada-002"].minimumCreditsRequired)
  ) {
    return account;
  } else {
    // GUARD
    console.log("guard_beforeRunningSearch.ts");
    throw new Error("402");
  }
}
