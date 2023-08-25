/*
  Warnings:

  - You are about to drop the `AccessGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AccessGroupToCustomRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AccessGroupToFile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AccessGroupToSummaryV2` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccessGroup" DROP CONSTRAINT "AccessGroup_createdById_fkey";

-- DropForeignKey
ALTER TABLE "AccountsAndAccessGroups" DROP CONSTRAINT "AccountsAndAccessGroups_accessGroupId_fkey";

-- DropForeignKey
ALTER TABLE "_AccessGroupToCustomRequest" DROP CONSTRAINT "_AccessGroupToCustomRequest_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccessGroupToCustomRequest" DROP CONSTRAINT "_AccessGroupToCustomRequest_B_fkey";

-- DropForeignKey
ALTER TABLE "_AccessGroupToFile" DROP CONSTRAINT "_AccessGroupToFile_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccessGroupToFile" DROP CONSTRAINT "_AccessGroupToFile_B_fkey";

-- DropForeignKey
ALTER TABLE "_AccessGroupToSummaryV2" DROP CONSTRAINT "_AccessGroupToSummaryV2_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccessGroupToSummaryV2" DROP CONSTRAINT "_AccessGroupToSummaryV2_B_fkey";

-- DropTable
DROP TABLE "AccessGroup";

-- DropTable
DROP TABLE "_AccessGroupToCustomRequest";

-- DropTable
DROP TABLE "_AccessGroupToFile";

-- DropTable
DROP TABLE "_AccessGroupToSummaryV2";

-- CreateTable
CREATE TABLE "AccessGroups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "AccessGroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AccessGroupsToFile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AccessGroupsToSummaryV2" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AccessGroupsToCustomRequest" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AccessGroupsToFile_AB_unique" ON "_AccessGroupsToFile"("A", "B");

-- CreateIndex
CREATE INDEX "_AccessGroupsToFile_B_index" ON "_AccessGroupsToFile"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AccessGroupsToSummaryV2_AB_unique" ON "_AccessGroupsToSummaryV2"("A", "B");

-- CreateIndex
CREATE INDEX "_AccessGroupsToSummaryV2_B_index" ON "_AccessGroupsToSummaryV2"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AccessGroupsToCustomRequest_AB_unique" ON "_AccessGroupsToCustomRequest"("A", "B");

-- CreateIndex
CREATE INDEX "_AccessGroupsToCustomRequest_B_index" ON "_AccessGroupsToCustomRequest"("B");

-- AddForeignKey
ALTER TABLE "AccountsAndAccessGroups" ADD CONSTRAINT "AccountsAndAccessGroups_accessGroupId_fkey" FOREIGN KEY ("accessGroupId") REFERENCES "AccessGroups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessGroups" ADD CONSTRAINT "AccessGroups_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessGroupsToFile" ADD CONSTRAINT "_AccessGroupsToFile_A_fkey" FOREIGN KEY ("A") REFERENCES "AccessGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessGroupsToFile" ADD CONSTRAINT "_AccessGroupsToFile_B_fkey" FOREIGN KEY ("B") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessGroupsToSummaryV2" ADD CONSTRAINT "_AccessGroupsToSummaryV2_A_fkey" FOREIGN KEY ("A") REFERENCES "AccessGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessGroupsToSummaryV2" ADD CONSTRAINT "_AccessGroupsToSummaryV2_B_fkey" FOREIGN KEY ("B") REFERENCES "SummaryV2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessGroupsToCustomRequest" ADD CONSTRAINT "_AccessGroupsToCustomRequest_A_fkey" FOREIGN KEY ("A") REFERENCES "AccessGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessGroupsToCustomRequest" ADD CONSTRAINT "_AccessGroupsToCustomRequest_B_fkey" FOREIGN KEY ("B") REFERENCES "CustomRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
