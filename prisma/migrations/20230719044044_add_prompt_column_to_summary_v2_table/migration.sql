/*
  Warnings:

  - Added the required column `prompt` to the `SummaryV2` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SummaryV2" ADD COLUMN     "prompt" TEXT NOT NULL;
