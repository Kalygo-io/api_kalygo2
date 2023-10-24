/*
  Warnings:

  - You are about to drop the `SummariesAndAccessGroups` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SummariesAndAccessGroups" DROP CONSTRAINT "SummariesAndAccessGroups_accessGroupId_fkey";

-- DropForeignKey
ALTER TABLE "SummariesAndAccessGroups" DROP CONSTRAINT "SummariesAndAccessGroups_summaryV2Id_fkey";

-- DropForeignKey
ALTER TABLE "SummariesAndAccessGroups" DROP CONSTRAINT "SummariesAndAccessGroups_summaryV3Id_fkey";

-- DropTable
DROP TABLE "SummariesAndAccessGroups";

-- CreateTable
CREATE TABLE "SummaryV2sAndAccessGroups" (
    "summaryV2Id" INTEGER NOT NULL,
    "accessGroupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "SummaryV2sAndAccessGroups_pkey" PRIMARY KEY ("summaryV2Id","accessGroupId")
);

-- CreateTable
CREATE TABLE "SummaryV3sAndAccessGroups" (
    "summaryV3Id" INTEGER NOT NULL,
    "accessGroupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "SummaryV3sAndAccessGroups_pkey" PRIMARY KEY ("summaryV3Id","accessGroupId")
);

-- AddForeignKey
ALTER TABLE "SummaryV2sAndAccessGroups" ADD CONSTRAINT "SummaryV2sAndAccessGroups_summaryV2Id_fkey" FOREIGN KEY ("summaryV2Id") REFERENCES "SummaryV2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SummaryV2sAndAccessGroups" ADD CONSTRAINT "SummaryV2sAndAccessGroups_accessGroupId_fkey" FOREIGN KEY ("accessGroupId") REFERENCES "AccessGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SummaryV3sAndAccessGroups" ADD CONSTRAINT "SummaryV3sAndAccessGroups_summaryV3Id_fkey" FOREIGN KEY ("summaryV3Id") REFERENCES "SummaryV3"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SummaryV3sAndAccessGroups" ADD CONSTRAINT "SummaryV3sAndAccessGroups_accessGroupId_fkey" FOREIGN KEY ("accessGroupId") REFERENCES "AccessGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
