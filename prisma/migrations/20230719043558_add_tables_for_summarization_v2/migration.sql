-- CreateTable
CREATE TABLE "SummaryV2" (
    "id" SERIAL NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "completionResponse" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "SummaryV2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "summaryId" INTEGER NOT NULL,
    "bucket" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "hash" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SummaryV2" ADD CONSTRAINT "SummaryV2_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "SummaryV2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
