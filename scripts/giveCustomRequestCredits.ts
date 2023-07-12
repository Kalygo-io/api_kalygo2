import "dotenv/config";
import prisma from "@/db/prisma_client";

async function giveCustomRequestCredits() {
  const email = `test@test.com`;

  const account = await prisma.account.findFirst({
    where: {
      email,
      emailVerified: true,
    },
  });

  const customRequestCredits = await prisma.customRequestCredits.create({
    data: {
      amount: 7,
      accountId: account!.id,
    },
  });

  // const customRequestCredits = await prisma.customRequestCredits.update({
  //   where: {
  //     accountId: account!.id,
  //   },
  //   data: {
  //     amount: 7,
  //   },
  // });
}

giveCustomRequestCredits();
