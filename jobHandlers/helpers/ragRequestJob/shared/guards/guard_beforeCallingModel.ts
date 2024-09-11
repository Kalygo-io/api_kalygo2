import config from "@/config";
import { supportedOpenAiModels } from "@/config/models";
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
      VectorSearchCredits: true,
      UsageCredits: true,
    },
  });

  if (
    (supportedOpenAiModels.includes(model) &&
      account?.UsageCredits?.amount! >
        config.models[model].minimumCreditsRequired) ||
    (account?.VectorSearchCredits?.amount! || 0) > 0
  ) {
    console.log("passing guard_beforeCallingModel...");
  } else {
    console.log("--- guard_beforeCallingModel THROWING ---");

    throw new Error("402");
  }
}
