-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ScanningMode" ADD VALUE 'FILE_OVERALL';
ALTER TYPE "ScanningMode" ADD VALUE 'FILE_IN_CHUNKS';
ALTER TYPE "ScanningMode" ADD VALUE 'FILE_PER_PAGE';

-- AlterEnum
ALTER TYPE "SummaryMode" ADD VALUE 'FILE_PER_PAGE';

-- AlterTable
ALTER TABLE "SummaryV2" ADD COLUMN     "scanMode" "ScanningMode" NOT NULL DEFAULT 'PRIOR_TO_TRACKING_MODE';

-- AlterTable
ALTER TABLE "SummaryV3" ADD COLUMN     "scanMode" "ScanningMode" NOT NULL DEFAULT 'PRIOR_TO_TRACKING_MODE';
