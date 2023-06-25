/*
  Warnings:

  - You are about to drop the column `summaryCreditsId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `vectorSearchCreditsId` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "summaryCreditsId",
DROP COLUMN "vectorSearchCreditsId";
