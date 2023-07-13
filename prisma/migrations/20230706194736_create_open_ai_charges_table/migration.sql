-- CreateTable
CREATE TABLE "OpenAiCharges" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "OpenAiCharges_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OpenAiCharges" ADD CONSTRAINT "OpenAiCharges_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
