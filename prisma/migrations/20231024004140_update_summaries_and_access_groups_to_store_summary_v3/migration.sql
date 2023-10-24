/*
  Warnings:

  - The primary key for the `SummariesAndAccessGroups` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `summaryId` on the `SummariesAndAccessGroups` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "SummariesAndAccessGroups" DROP CONSTRAINT "SummariesAndAccessGroups_summaryId_fkey";

-- AlterTable
ALTER TABLE "SummariesAndAccessGroups" DROP CONSTRAINT "SummariesAndAccessGroups_pkey",
DROP COLUMN "summaryId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "summaryV2Id" INTEGER,
ADD CONSTRAINT "SummariesAndAccessGroups_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "SummariesAndAccessGroups" ADD CONSTRAINT "SummariesAndAccessGroups_summaryV2Id_fkey" FOREIGN KEY ("summaryV2Id") REFERENCES "SummaryV2"("id") ON DELETE SET NULL ON UPDATE CASCADE;
