import "dotenv/config";
import prisma from "@/db/prisma_client";

async function giveVectorSearchCredits() {
  const email = `test@test.com`;

  const account = await prisma.account.findFirst({
    where: {
      email,
      emailVerified: true,
    },
  });

  const vectorSearchCredits = await prisma.vectorSearchCredits.update({
    where: {
      accountId: account!.id,
    },
    data: {
      amount: 7,
    },
  });
}

giveVectorSearchCredits();
