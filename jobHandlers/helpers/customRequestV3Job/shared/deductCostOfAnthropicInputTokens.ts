import prisma from "@/db/prisma_client";
import { SupportedAnthropicModels } from "@/types/SupportedAnthropicModels";
import { p } from "@/utils/p";

export async function deductCostOfAnthropicInputTokens(
  promptTokenCount: number,
  model: SupportedAnthropicModels,
  config: any,
  account: any
): Promise<void> {
  p("deductCostOfInputTokens...");
  const inputTokenCost =
    (promptTokenCount /
      config.models.anthropic[model].pricing.input.perTokens) *
    config.models.anthropic[model].pricing.input.rate;
  // prettier-ignore
  console.log("Cost of INPUT_TOKENS", inputTokenCost, account?.UsageCredits?.amount);
  if (!account?.CustomRequestCredits?.amount) {
    await prisma.usageCredits.update({
      data: {
        amount: {
          decrement: inputTokenCost * 100, // * 100 as Usage credits are denominated in pennies
        },
      },
      where: {
        accountId: account?.id,
      },
    });
  }
}
