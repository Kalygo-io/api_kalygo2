/*
  Warnings:

  - You are about to drop the `_AccessGroupToSummaryV2` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AccessGroupToSummaryV2" DROP CONSTRAINT "_AccessGroupToSummaryV2_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccessGroupToSummaryV2" DROP CONSTRAINT "_AccessGroupToSummaryV2_B_fkey";

-- DropTable
DROP TABLE "_AccessGroupToSummaryV2";

-- CreateTable
CREATE TABLE "SummariesAndAccessGroups" (
    "summaryId" INTEGER NOT NULL,
    "accessGroupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "SummariesAndAccessGroups_pkey" PRIMARY KEY ("summaryId","accessGroupId")
);

-- AddForeignKey
ALTER TABLE "SummariesAndAccessGroups" ADD CONSTRAINT "SummariesAndAccessGroups_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "SummaryV2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SummariesAndAccessGroups" ADD CONSTRAINT "SummariesAndAccessGroups_accessGroupId_fkey" FOREIGN KEY ("accessGroupId") REFERENCES "AccessGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
