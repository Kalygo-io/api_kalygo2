-- AlterTable
ALTER TABLE "File" ADD COLUMN     "summaryV3Id" INTEGER;

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "summaryV3Id" INTEGER;

-- AlterTable
ALTER TABLE "SummariesAndAccessGroups" ADD COLUMN     "summaryV3Id" INTEGER;

-- CreateTable
CREATE TABLE "SummaryV3" (
    "id" SERIAL NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "mode" "SummaryMode" NOT NULL DEFAULT 'PRIOR_TO_TRACKING_MODE',
    "summary" JSONB NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "model" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "SummaryV3_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SummaryV3" ADD CONSTRAINT "SummaryV3_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_summaryV3Id_fkey" FOREIGN KEY ("summaryV3Id") REFERENCES "SummaryV3"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_summaryV3Id_fkey" FOREIGN KEY ("summaryV3Id") REFERENCES "SummaryV3"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SummariesAndAccessGroups" ADD CONSTRAINT "SummariesAndAccessGroups_summaryV3Id_fkey" FOREIGN KEY ("summaryV3Id") REFERENCES "SummaryV3"("id") ON DELETE SET NULL ON UPDATE CASCADE;
