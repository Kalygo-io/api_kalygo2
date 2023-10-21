import prisma from "@/db/prisma_client";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";

export async function deductCostOfOpenAiOutputTokens(
  outputTokenCount: number,
  model: SupportedOpenAiModels,
  config: any,
  account: any
) {
  // *** Deducting cost of OUTPUT_TOKENS from credit balance ***
  const outputTokenCost =
    (outputTokenCount / config.models[model].pricing.output.perTokens) *
    config.models[model].pricing.output.rate;
  console.log(
    "Cost of OUTPUT_TOKENS - now deducting from credits balance...",
    outputTokenCost,
    account?.UsageCredits?.amount
  );
  // ***
  if (!account?.SummaryCredits?.amount) {
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
