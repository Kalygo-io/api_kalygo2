-- CreateTable
CREATE TABLE "SummaryCredits" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SummaryCredits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VectorSearchCredits" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VectorSearchCredits_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SummaryCredits" ADD CONSTRAINT "SummaryCredits_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VectorSearchCredits" ADD CONSTRAINT "VectorSearchCredits_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
