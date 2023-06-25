import "dotenv/config";
import prisma from "@/db/prisma_client";

async function giveSummaryCredits() {
  const email = "tad@cmdlabs.io";

  const account = await prisma.account.findFirst({
    where: {
      email,
      emailVerified: true,
    },
  });

  const summaryCredits = await prisma.summaryCredits.create({
    data: {
      accountId: account!.id,
      amount: 7,
    },
  });
}

giveSummaryCredits();
