/*
  Warnings:

  - Added the required column `condensedCharCount` to the `Summary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalCharCount` to the `Summary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Summary" ADD COLUMN     "condensedCharCount" INTEGER NOT NULL,
ADD COLUMN     "originalCharCount" INTEGER NOT NULL;
