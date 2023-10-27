/*
  Warnings:

  - A unique constraint covering the columns `[secretId]` on the table `AwsSecretsManagerApiKey` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AwsSecretsManagerApiKey_secretId_key" ON "AwsSecretsManagerApiKey"("secretId");
