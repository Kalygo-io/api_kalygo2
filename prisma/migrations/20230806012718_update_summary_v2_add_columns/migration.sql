/*
  Warnings:

  - Added the required column `format` to the `SummaryV2` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `SummaryV2` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `SummaryV2` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SummaryV2" ADD COLUMN     "format" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "language" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "model" TEXT NOT NULL DEFAULT '';