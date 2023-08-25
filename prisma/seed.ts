import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  let accessGroups = await prisma.accessGroup.findMany({});
  console.log("accessGroups", accessGroups);

  await prisma.accessGroup.upsert({
    update: {
      name: "Public",
      visible: true,
    },
    where: {
      id: 1,
    },
    create: {
      name: "public",
      createdById: 1,
      visible: true,
    },
  });

  //   await prisma.accessGroup.delete({
  //     where: {
  //       id: 3,
  //     },
  //   });

  accessGroups = await prisma.accessGroup.findMany({});
  console.log("accessGroups", accessGroups);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
