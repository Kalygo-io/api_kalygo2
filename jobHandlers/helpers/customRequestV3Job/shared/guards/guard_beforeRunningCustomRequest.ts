import { stripe } from "@/clients/stripe_client";
import config from "@/config";
import { supportedOpenAiModels } from "@/config/models";
import prisma from "@/db/prisma_client";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";
import { SupportedReplicateModels } from "@/types/SupportedReplicateModels";

export async function guard_beforeRunningCustomRequest(
  email: string,
  model: SupportedOpenAiModels | SupportedReplicateModels
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
    (model ===
      "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3" ||
      supportedOpenAiModels.includes(model)) &&
    (account?.UsageCredits?.amount! >
      config.models[model].minimumCreditsRequired ||
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
