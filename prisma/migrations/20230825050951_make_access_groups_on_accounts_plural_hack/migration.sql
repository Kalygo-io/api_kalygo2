/*
  Warnings:

  - You are about to drop the `AccessGroups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AccessGroupsToCustomRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AccessGroupsToFile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AccessGroupsToSummaryV2` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccessGroups" DROP CONSTRAINT "AccessGroups_createdById_fkey";

-- DropForeignKey
ALTER TABLE "AccountsAndAccessGroups" DROP CONSTRAINT "AccountsAndAccessGroups_accessGroupId_fkey";

-- DropForeignKey
ALTER TABLE "_AccessGroupsToCustomRequest" DROP CONSTRAINT "_AccessGroupsToCustomRequest_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccessGroupsToCustomRequest" DROP CONSTRAINT "_AccessGroupsToCustomRequest_B_fkey";

-- DropForeignKey
ALTER TABLE "_AccessGroupsToFile" DROP CONSTRAINT "_AccessGroupsToFile_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccessGroupsToFile" DROP CONSTRAINT "_AccessGroupsToFile_B_fkey";

-- DropForeignKey
ALTER TABLE "_AccessGroupsToSummaryV2" DROP CONSTRAINT "_AccessGroupsToSummaryV2_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccessGroupsToSummaryV2" DROP CONSTRAINT "_AccessGroupsToSummaryV2_B_fkey";

-- DropTable
DROP TABLE "AccessGroups";

-- DropTable
DROP TABLE "_AccessGroupsToCustomRequest";

-- DropTable
DROP TABLE "_AccessGroupsToFile";

-- DropTable
DROP TABLE "_AccessGroupsToSummaryV2";

-- CreateTable
CREATE TABLE "AccessGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "AccessGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AccessGroupToFile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AccessGroupToSummaryV2" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AccessGroupToCustomRequest" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AccessGroupToFile_AB_unique" ON "_AccessGroupToFile"("A", "B");

-- CreateIndex
CREATE INDEX "_AccessGroupToFile_B_index" ON "_AccessGroupToFile"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AccessGroupToSummaryV2_AB_unique" ON "_AccessGroupToSummaryV2"("A", "B");

-- CreateIndex
CREATE INDEX "_AccessGroupToSummaryV2_B_index" ON "_AccessGroupToSummaryV2"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AccessGroupToCustomRequest_AB_unique" ON "_AccessGroupToCustomRequest"("A", "B");

-- CreateIndex
CREATE INDEX "_AccessGroupToCustomRequest_B_index" ON "_AccessGroupToCustomRequest"("B");

-- AddForeignKey
ALTER TABLE "AccountsAndAccessGroups" ADD CONSTRAINT "AccountsAndAccessGroups_accessGroupId_fkey" FOREIGN KEY ("accessGroupId") REFERENCES "AccessGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessGroup" ADD CONSTRAINT "AccessGroup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessGroupToFile" ADD CONSTRAINT "_AccessGroupToFile_A_fkey" FOREIGN KEY ("A") REFERENCES "AccessGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessGroupToFile" ADD CONSTRAINT "_AccessGroupToFile_B_fkey" FOREIGN KEY ("B") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessGroupToSummaryV2" ADD CONSTRAINT "_AccessGroupToSummaryV2_A_fkey" FOREIGN KEY ("A") REFERENCES "AccessGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessGroupToSummaryV2" ADD CONSTRAINT "_AccessGroupToSummaryV2_B_fkey" FOREIGN KEY ("B") REFERENCES "SummaryV2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessGroupToCustomRequest" ADD CONSTRAINT "_AccessGroupToCustomRequest_A_fkey" FOREIGN KEY ("A") REFERENCES "AccessGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessGroupToCustomRequest" ADD CONSTRAINT "_AccessGroupToCustomRequest_B_fkey" FOREIGN KEY ("B") REFERENCES "CustomRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
