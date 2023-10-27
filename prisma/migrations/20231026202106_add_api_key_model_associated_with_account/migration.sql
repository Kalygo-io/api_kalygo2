-- CreateEnum
CREATE TYPE "SupportedApiKeys" AS ENUM ('OPEN_AI_API_KEY', 'AWS_SES_ACCESS_KEY', 'AWS_SES_SECRET_KEY');

-- CreateTable
CREATE TABLE "AwsSecretsManagerApiKey" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER,
    "name" TEXT NOT NULL,
    "type" "SupportedApiKeys" NOT NULL,

    CONSTRAINT "AwsSecretsManagerApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AwsSecretsManagerApiKey_accountId_type_key" ON "AwsSecretsManagerApiKey"("accountId", "type");

-- AddForeignKey
ALTER TABLE "AwsSecretsManagerApiKey" ADD CONSTRAINT "AwsSecretsManagerApiKey_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
