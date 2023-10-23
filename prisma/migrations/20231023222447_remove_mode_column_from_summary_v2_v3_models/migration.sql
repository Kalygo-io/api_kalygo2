/*
  Warnings:

  - You are about to drop the column `mode` on the `SummaryV2` table. All the data in the column will be lost.
  - You are about to drop the column `mode` on the `SummaryV3` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SummaryV2" DROP COLUMN "mode";

-- AlterTable
ALTER TABLE "SummaryV3" DROP COLUMN "mode";
