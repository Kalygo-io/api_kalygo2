-- CreateTable
CREATE TABLE "RAGRequest" (
    "id" SERIAL NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL DEFAULT '',
    "bucket" TEXT NOT NULL,
    "bucketKey" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "completion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "RAGRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RAGRequest" ADD CONSTRAINT "RAGRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
