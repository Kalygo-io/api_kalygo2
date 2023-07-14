/*
  Warnings:

  - You are about to drop the column `orgId` on the `Role` table. All the data in the column will be lost.
  - Added the required column `accountId` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_orgId_fkey";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "orgId",
ADD COLUMN     "accountId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
