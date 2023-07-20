import "dotenv/config";
import prisma from "@/db/prisma_client";

async function deleteAccount() {
  const email = "thaddadavis@gmail.com";
  // const email = "ceemmmdee@gmail.com";

  const account = await prisma.account.findFirst({
    where: {
      email,
      // emailVerified: true,
    },
  });

  await prisma.summaryCredits.deleteMany({
    where: {
      accountId: account!.id,
    },
  });

  await prisma.vectorSearchCredits.deleteMany({
    where: {
      accountId: account!.id,
    },
  });

  await prisma.customRequestCredits.deleteMany({
    where: {
      accountId: account!.id,
    },
  });

  await prisma.role.deleteMany({
    where: {
      accountId: account!.id,
    },
  });

  await prisma.account.delete({
    where: {
      id: account!.id,
    },
  });
}

deleteAccount();
