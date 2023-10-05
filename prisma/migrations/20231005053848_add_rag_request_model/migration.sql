/*
  Warnings:

  - You are about to drop the `RAGRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RAGRequest" DROP CONSTRAINT "RAGRequest_requesterId_fkey";

-- DropTable
DROP TABLE "RAGRequest";

-- CreateTable
CREATE TABLE "RagRequest" (
    "id" SERIAL NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL DEFAULT '',
    "bucket" TEXT NOT NULL,
    "bucketKey" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "completion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "RagRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RagRequest" ADD CONSTRAINT "RagRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
