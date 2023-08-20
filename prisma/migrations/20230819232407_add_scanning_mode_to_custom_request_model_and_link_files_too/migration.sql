-- AlterTable
ALTER TABLE "CustomRequest" ADD COLUMN     "mode" "ScanningMode" NOT NULL DEFAULT 'PRIOR_TO_TRACKING_MODE';

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "customRequestId" INTEGER;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_customRequestId_fkey" FOREIGN KEY ("customRequestId") REFERENCES "CustomRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
