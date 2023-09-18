import config from "@/config";
import prisma from "@/db/prisma_client";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";

export async function guard_beforeCallingModel(
  email: string,
  model: SupportedOpenAiModels
) {
  console.log("--- guard_beforeCallingModel ---");

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

  if (
    ((model === "gpt-3.5-turbo" ||
      model === "gpt-3.5-turbo-16k" ||
      model === "gpt-4") &&
      account?.UsageCredits?.amount! >
        config.models[model].minimumCreditsRequired) ||
    (account?.CustomRequestCredits?.amount! || 0) > 0
  ) {
    console.log("passing guard_beforeCallingModel...");
  } else {
    console.log("--- guard_beforeCallingModel THROWING ---");

    throw new Error("402");
  }
}
