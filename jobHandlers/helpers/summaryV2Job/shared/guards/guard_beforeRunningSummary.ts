import { stripe } from "@/clients/stripe_client";
import config from "@/config";
import prisma from "@/db/prisma_client";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";
import { SupportedReplicateModels } from "@/types/SupportedReplicateModels";

export async function guard_beforeRunningSummary(
  email: string,
  model: SupportedOpenAiModels | SupportedReplicateModels
) {
  let account = await prisma.account.findFirst({
    where: {
      email: email,
      emailVerified: true,
    },
    include: {
      SummaryCredits: true,
      UsageCredits: true,
    },
  });

  // prettier-ignore
  const customerSearchResults = await stripe.customers.search({ // FIND EXISTING STRIPE CUSTOMER
    // @ts-ignore
    query: `email:\'${account.email}\'`,
  });
  if (
    customerSearchResults.data[0].id &&
    (model === "gpt-3.5-turbo-16k" ||
      model === "gpt-3.5-turbo" ||
      model === "gpt-4") &&
    (account?.UsageCredits?.amount! >
      config.models[model].minimumCreditsRequired ||
      (account?.SummaryCredits?.amount! || 0) > 0)
  ) {
    console.log("passing guard_beforeRunningSummary...");
  } else {
    throw new Error("402");
  }

  return {
    account,
    customerId: customerSearchResults.data[0].id,
  };
}
