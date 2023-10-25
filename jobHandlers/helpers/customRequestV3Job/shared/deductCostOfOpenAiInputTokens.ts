import prisma from "@/db/prisma_client";
import { SupportedOpenAiModels } from "@/types/SupportedOpenAiModels";
import { p } from "@/utils/p";

export async function deductCostOfOpenAiInputTokens(
  promptTokenCount: number,
  model: SupportedOpenAiModels,
  config: any,
  account: any
): Promise<void> {
  p("deductCostOfInputTokens...");
  const inputTokenCost =
    (promptTokenCount / config.models[model].pricing.input.perTokens) *
    config.models[model].pricing.input.rate;
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
