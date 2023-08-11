/*
  Warnings:

  - A unique constraint covering the columns `[accountId,smartSearchId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "smartSearchId" INTEGER;

-- CreateTable
CREATE TABLE "SmartSearch" (
    "id" SERIAL NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "fileHash" TEXT,
    "hashAlgorithm" TEXT,
    "bucket" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "results" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "SmartSearch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rating_accountId_smartSearchId_key" ON "Rating"("accountId", "smartSearchId");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_smartSearchId_fkey" FOREIGN KEY ("smartSearchId") REFERENCES "SmartSearch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartSearch" ADD CONSTRAINT "SmartSearch_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
