/*
  Warnings:

  - A unique constraint covering the columns `[accountId]` on the table `SummaryCredits` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountId]` on the table `VectorSearchCredits` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "summaryCreditsId" INTEGER,
ADD COLUMN     "vectorSearchCreditsId" INTEGER;

-- AlterTable
ALTER TABLE "SummaryCredits" ALTER COLUMN "amount" DROP DEFAULT;

-- AlterTable
ALTER TABLE "VectorSearchCredits" ALTER COLUMN "amount" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "SummaryCredits_accountId_key" ON "SummaryCredits"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "VectorSearchCredits_accountId_key" ON "VectorSearchCredits"("accountId");
