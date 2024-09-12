import { stripe } from "@/clients/stripe_client";
import config from "@/config";
import { supportedAnthropicModels } from "@/config/models";
import prisma from "@/db/prisma_client";
import { SupportedAnthropicModels } from "@/types/SupportedAnthropicModels";

export async function guard_beforeRunningCustomRequestWithAnthropic(
  email: string,
  model: SupportedAnthropicModels
) {
  let account = await prisma.account.findFirst({
    where: {
      email: email,
      emailVerified: true,
    },
    include: {
      CustomRequestCredits: true,
      UsageCredits: true,
    },
  });

  // prettier-ignore
  const customerSearchResults = await stripe.customers.search({
    // @ts-ignore
    query: `email:\'${account.email}\'`,
  });
  if (
    customerSearchResults.data[0].id &&
    supportedAnthropicModels.includes(model) &&
    (account?.UsageCredits?.amount! >
      config.models.anthropic[model].minimumCreditsRequired ||
      (account?.CustomRequestCredits?.amount! || 0) > 0)
  ) {
    console.log("passing guard_beforeRunningCustomRequest...");
  } else {
    throw new Error("402");
  }

  return {
    account,
    customerId: customerSearchResults.data[0].id,
  };
}
