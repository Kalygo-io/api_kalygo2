import "dotenv/config";
import prisma from "@/db/prisma_client";

async function giveSummaryCredits() {
  const email = "test@test.com";

  const account = await prisma.account.findFirst({
    where: {
      email,
      emailVerified: true,
    },
  });

  const summaryCredits = await prisma.summaryCredits.update({
    where: {
      accountId: account!.id,
    },
    data: {
      amount: 7,
    },
  });

  // const summaryCredits = await prisma.summaryCredits.update({
  //   where: {
  //     accountId: account!.id,
  //   },
  //   data: {
  //     amount: 7,
  //   },
  // });
}

giveSummaryCredits();
