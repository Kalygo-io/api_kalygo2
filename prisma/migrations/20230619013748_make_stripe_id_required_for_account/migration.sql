/*
  Warnings:

  - Made the column `stripeId` on table `Account` required. This step will fail if there are existing NULL values in that column.

*/

UPDATE "Account" SET "stripeId" = 'tmp';

-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "stripeId" SET NOT NULL,
ALTER COLUMN "stripeId" SET DEFAULT '';
