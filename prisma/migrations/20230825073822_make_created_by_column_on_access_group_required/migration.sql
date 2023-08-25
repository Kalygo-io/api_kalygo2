/*
  Warnings:

  - Made the column `createdById` on table `AccessGroup` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "AccessGroup" DROP CONSTRAINT "AccessGroup_createdById_fkey";

-- AlterTable
ALTER TABLE "AccessGroup" ALTER COLUMN "createdById" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "AccessGroup" ADD CONSTRAINT "AccessGroup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
