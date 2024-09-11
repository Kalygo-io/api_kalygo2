import { stripe } from "@/clients/stripe_client";
import config from "@/config";
import prisma from "@/db/prisma_client";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";
import { SupportedReplicateModels } from "@/types/SupportedReplicateModels";
import { SupportedApiKeys } from "@prisma/client";

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
      AwsSecretsManagerApiKey: true,
    },
  });
  const accountOpenAiApiKeyReference = account?.AwsSecretsManagerApiKey.find(
    (i) => {
      return i.type === SupportedApiKeys.OPEN_AI_API_KEY;
    }
  );
  // prettier-ignore
  const customerSearchResults = await stripe.customers.search({ // FIND EXISTING STRIPE CUSTOMER
    // @ts-ignore
    query: `email:\'${account.email}\'`,
  });
  if (
    (customerSearchResults.data[0].id &&
      (model ===
        "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3" ||
        model === "gpt-3.5-turbo-16k" ||
        model === "gpt-3.5-turbo" ||
        model === "gpt-4o" ||
        model === "gpt-4o-mini") &&
      (account?.UsageCredits?.amount! >
        config.models[model].minimumCreditsRequired ||
        (account?.SummaryCredits?.amount! || 0) > 0)) ||
    accountOpenAiApiKeyReference
  ) {
    console.log("passing guard_beforeRunningSummary...");
  } else {
    throw new Error("402");
  }

  return {
    account,
    customerId: customerSearchResults.data[0].id,
    accountOpenAiApiKeyReference,
  };
}
