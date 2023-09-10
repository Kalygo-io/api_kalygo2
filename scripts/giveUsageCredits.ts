import "dotenv/config";
import prisma from "@/db/prisma_client";

async function giveUsageCredits() {
  // const email = "test@test.com";
  const email = "tad@cmdlabs.io";

  const account = await prisma.account.findFirst({
    where: {
      email,
      emailVerified: true,
    },
  });

  //   const usageCredits = await prisma.usageCredits.create({
  //     data: {
  //       amount: 7,
  //       accountId: account!.id,
  //     },
  //   });

  const usageCredits = await prisma.usageCredits.update({
    where: {
      accountId: account!.id,
    },
    data: {
      amount: {
        increment: 100,
      },
    },
  });
}

giveUsageCredits();
