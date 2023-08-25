/*
  Warnings:

  - You are about to drop the `_AccessGroupToAccount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AccessGroupToAccount" DROP CONSTRAINT "_AccessGroupToAccount_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccessGroupToAccount" DROP CONSTRAINT "_AccessGroupToAccount_B_fkey";

-- DropTable
DROP TABLE "_AccessGroupToAccount";

-- CreateTable
CREATE TABLE "AccountsAndAccessGroups" (
    "accountId" INTEGER NOT NULL,
    "accessGroupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "AccountsAndAccessGroups_pkey" PRIMARY KEY ("accessGroupId","accountId")
);

-- AddForeignKey
ALTER TABLE "AccountsAndAccessGroups" ADD CONSTRAINT "AccountsAndAccessGroups_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountsAndAccessGroups" ADD CONSTRAINT "AccountsAndAccessGroups_accessGroupId_fkey" FOREIGN KEY ("accessGroupId") REFERENCES "AccessGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
