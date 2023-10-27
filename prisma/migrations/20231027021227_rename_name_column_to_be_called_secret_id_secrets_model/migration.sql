/*
  Warnings:

  - You are about to drop the column `name` on the `AwsSecretsManagerApiKey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AwsSecretsManagerApiKey" DROP COLUMN "name",
ADD COLUMN     "secretId" TEXT NOT NULL DEFAULT '';
