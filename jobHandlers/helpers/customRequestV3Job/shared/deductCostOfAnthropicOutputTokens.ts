import prisma from "@/db/prisma_client";
import { SupportedAnthropicModels } from "@/types/SupportedAnthropicModels";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";
import { p } from "@/utils/p";

export async function deductCostOfAnthropicOutputTokens(
  outputTokenCount: number,
  model: SupportedAnthropicModels,
  config: any,
  account: any
) {
  // *** Deducting cost of OUTPUT_TOKENS from credit balance ***
  const outputTokenCost =
    (outputTokenCount /
      config.models.anthropic[model].pricing.output.perTokens) *
    config.models.anthropic[model].pricing.output.rate;
  p(
    "Cost of OUTPUT_TOKENS - now deducting from credits balance...",
    outputTokenCost,
    account?.UsageCredits?.amount
  );
  // ***
  if (!account?.CustomRequestCredits?.amount) {
    await prisma.usageCredits.update({
      data: {
        amount: {
          decrement: outputTokenCost * 100, // * 100 as Usage credits are denominated in pennies
        },
      },
      where: {
        accountId: account?.id,
      },
    });
  }
}
