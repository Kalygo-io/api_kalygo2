import config from "@/config";
import { supportedOpenAiModels } from "@/config/models";
import prisma from "@/db/prisma_client";
import { SupportedAnthropicModels } from "@/types/SupportedAnthropicModels";

export async function guard_beforeCallingAnthropicModel(
  email: string,
  model: SupportedAnthropicModels
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

  if (
    (model === "claude-3-5-sonnet-20240620" &&
      account?.UsageCredits?.amount! >
        config.models.anthropic[model].minimumCreditsRequired) ||
    (account?.SummaryCredits?.amount! || 0) > 0
  ) {
    console.log("passing guard_beforeCallingModel...");
  } else {
    throw new Error("402");
  }
}
