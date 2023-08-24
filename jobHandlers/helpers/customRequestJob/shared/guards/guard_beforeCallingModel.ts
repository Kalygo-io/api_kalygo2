import config from "@/config";
import prisma from "@/db/prisma_client";

export async function guard_beforeCallingModel(
  email: string,
  model: "gpt-3.5-turbo" | "gpt-4"
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
    ((model === "gpt-3.5-turbo" || model === "gpt-4") &&
      account?.UsageCredits?.amount! >
        config.models[model].minimumCreditsRequired) ||
    (account?.SummaryCredits?.amount! || 0) > 0
  ) {
    console.log("passing guard_beforeCallingModel...");
  } else {
    throw new Error("402");
  }
}