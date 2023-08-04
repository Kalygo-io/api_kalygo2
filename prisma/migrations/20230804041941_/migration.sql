/*
  Warnings:

  - A unique constraint covering the columns `[accountId,summaryV2Id]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountId,customRequestId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "accountId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Rating_accountId_summaryV2Id_key" ON "Rating"("accountId", "summaryV2Id");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_accountId_customRequestId_key" ON "Rating"("accountId", "customRequestId");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
