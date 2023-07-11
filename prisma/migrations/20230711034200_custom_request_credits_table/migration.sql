-- CreateTable
CREATE TABLE "CustomRequestCredits" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "CustomRequestCredits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomRequestCredits_accountId_key" ON "CustomRequestCredits"("accountId");

-- AddForeignKey
ALTER TABLE "CustomRequestCredits" ADD CONSTRAINT "CustomRequestCredits_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
