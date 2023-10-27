/*
  Warnings:

  - Made the column `accountId` on table `AwsSecretsManagerApiKey` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "AwsSecretsManagerApiKey" DROP CONSTRAINT "AwsSecretsManagerApiKey_accountId_fkey";

-- AlterTable
ALTER TABLE "AwsSecretsManagerApiKey" ALTER COLUMN "accountId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "AwsSecretsManagerApiKey" ADD CONSTRAINT "AwsSecretsManagerApiKey_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
