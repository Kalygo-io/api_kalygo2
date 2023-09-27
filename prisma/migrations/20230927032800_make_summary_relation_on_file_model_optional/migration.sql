-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_summaryId_fkey";

-- AlterTable
ALTER TABLE "File" ALTER COLUMN "summaryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "SummaryV2"("id") ON DELETE SET NULL ON UPDATE CASCADE;
