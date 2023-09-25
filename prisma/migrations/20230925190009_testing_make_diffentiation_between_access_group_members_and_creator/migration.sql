/*
  Warnings:

  - You are about to drop the column `createdBy` on the `AccountsAndAccessGroups` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AccountsAndAccessGroups" DROP COLUMN "createdBy",
ADD COLUMN     "createdById" INTEGER;

-- AddForeignKey
ALTER TABLE "AccountsAndAccessGroups" ADD CONSTRAINT "AccountsAndAccessGroups_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
