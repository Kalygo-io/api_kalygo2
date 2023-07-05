import "dotenv/config";
import prisma from "@/db/prisma_client";

async function giveVectorSearchCredits() {
  const email = `tad@cmdlabs.io`;

  const account = await prisma.account.findFirst({
    where: {
      email,
      emailVerified: true,
    },
  });

  const vectorSearchCredits = await prisma.vectorSearchCredits.create({
    data: {
      accountId: account!.id,
      amount: 7,
    },
  });
}

giveVectorSearchCredits();
