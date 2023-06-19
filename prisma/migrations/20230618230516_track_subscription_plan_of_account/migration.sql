/*
  Warnings:

  - You are about to drop the `Film` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'STANDARD', 'PREMIUM');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE';

-- DropTable
DROP TABLE "Film";
