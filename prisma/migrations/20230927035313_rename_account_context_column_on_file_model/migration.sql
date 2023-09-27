/*
  Warnings:

  - You are about to drop the column `accountId` on the `File` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_accountId_fkey";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "accountId",
ADD COLUMN     "accountContextId" INTEGER;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_accountContextId_fkey" FOREIGN KEY ("accountContextId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
