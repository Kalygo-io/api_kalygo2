import "dotenv/config";
import prisma from "@/db/prisma_client";

async function deleteAccount() {
  const email = "tad@cmdlabs.io";
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

  await prisma.summary.deleteMany({
    where: {
      requesterId: account!.id,
    },
  });

  await prisma.vectorSearch.deleteMany({
    where: {
      requesterId: account!.id,
    },
  });

  await prisma.customRequest.deleteMany({
    where: {
      requesterId: account!.id,
    },
  });

  await prisma.summaryV2.deleteMany({
    where: {
      requesterId: account!.id,
    },
  });

  await prisma.login.deleteMany({
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
