/*
  Warnings:

  - You are about to drop the column `completionResponse` on the `SummaryV2` table. All the data in the column will be lost.
  - Added the required column `summary` to the `SummaryV2` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- ALTER TABLE "SummaryV2" DROP COLUMN "completionResponse",
-- ADD COLUMN     "summary" JSONB NOT NULL;

ALTER TABLE "SummaryV2" RENAME COLUMN "completionResponse" TO "summary";
