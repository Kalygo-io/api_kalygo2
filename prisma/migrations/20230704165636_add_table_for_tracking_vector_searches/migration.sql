-- CreateTable
CREATE TABLE "VectorSearch" (
    "id" SERIAL NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL DEFAULT '',
    "bucket" TEXT NOT NULL,
    "bucketKey" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "results" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "VectorSearch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VectorSearch" ADD CONSTRAINT "VectorSearch_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
