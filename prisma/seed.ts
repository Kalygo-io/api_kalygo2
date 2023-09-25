import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  let accessGroups = await prisma.accessGroup.findMany({});
  console.log("accessGroups", accessGroups);

  await prisma.accessGroup.upsert({
    update: {
      name: "Public",
      createdById: null,
    },
    where: {
      id: 1,
    },
    create: {
      name: "Public",
      createdById: null,
    },
  });

  await prisma.accessGroup.upsert({
    update: {
      name: "Admin",
      createdById: null,
    },
    where: {
      id: 2,
    },
    create: {
      name: "Admin",
      createdById: null,
      id: 2,
    },
  });

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
