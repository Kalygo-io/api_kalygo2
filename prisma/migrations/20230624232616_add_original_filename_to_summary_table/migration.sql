-- AlterTable
ALTER TABLE "Summary" ADD COLUMN     "originalFileName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "processedCharCount" INTEGER NOT NULL DEFAULT 0;
