-- CreateEnum
CREATE TYPE "SummaryMode" AS ENUM ('PRIOR_TO_TRACKING_MODE', 'OVERALL', 'EACH_FILE_OVERALL', 'EACH_FILE_IN_CHUNKS', 'EACH_FILE_PER_PAGE', 'EACH_FILE_PER_PAGE_THEN_OVERALL', 'EACH_FILE_OVERLAPPING_CHUNKS');

-- AlterTable
ALTER TABLE "SummaryV2" ADD COLUMN     "mode" "SummaryMode" NOT NULL DEFAULT 'PRIOR_TO_TRACKING_MODE';
