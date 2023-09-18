import { stripe } from "@/clients/stripe_client";
import config from "@/config";
import prisma from "@/db/prisma_client";
import { SupportedModels } from "@/types/SupportedModels";

export async function guard_beforeRunningCustomRequest(
  email: string,
  model: SupportedModels
) {
  console.log("--- guard_beforeRunningCustomRequest ---");

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
  const customerSearchResults = await stripe.customers.search({ // FIND EXISTING STRIPE CUSTOMER
    // @ts-ignore
    query: `email:\'${account.email}\'`,
  });

  console.log(
    "customerSearchResults.data[0].id",
    customerSearchResults.data[0].id
  );
  console.log("model", model);
  console.log("account?.UsageCredits?.amount!", account?.UsageCredits?.amount!);
  console.log(
    "config.models[model].minimumCreditsRequired",
    config.models[model].minimumCreditsRequired
  );
  console.log(
    "account?.UsageCredits?.amount! > config.models[model].minimumCreditsRequired",
    account?.UsageCredits?.amount! > config.models[model].minimumCreditsRequired
  );
  console.log("OR");
  console.log(
    "(account?.CustomRequestCredits?.amount! || 0) > 0",
    (account?.CustomRequestCredits?.amount! || 0) > 0
  );

  if (
    customerSearchResults.data[0].id &&
    (model === "gpt-3.5-turbo" ||
      model === "gpt-3.5-turbo-16k" ||
      model === "gpt-4") &&
    (account?.UsageCredits?.amount! >
      config.models[model].minimumCreditsRequired ||
      (account?.CustomRequestCredits?.amount! || 0) > 0)
  ) {
    console.log("passing guard_beforeRunningCustomRequest...");
  } else {
    console.log("--- guard_beforeRunningCustomRequest THROWING ---");
    throw new Error("402");
  }

  return {
    account,
    customerId: customerSearchResults.data[0].id,
  };
}
