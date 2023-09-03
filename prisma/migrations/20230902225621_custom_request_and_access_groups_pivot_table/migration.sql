/*
  Warnings:

  - You are about to drop the `_AccessGroupToCustomRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AccessGroupToCustomRequest" DROP CONSTRAINT "_AccessGroupToCustomRequest_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccessGroupToCustomRequest" DROP CONSTRAINT "_AccessGroupToCustomRequest_B_fkey";

-- AlterTable
ALTER TABLE "CustomRequest" ADD COLUMN     "accessGroupId" INTEGER;

-- DropTable
DROP TABLE "_AccessGroupToCustomRequest";

-- CreateTable
CREATE TABLE "CustomRequestsAndAccessGroups" (
    "customRequestId" INTEGER NOT NULL,
    "accessGroupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "CustomRequestsAndAccessGroups_pkey" PRIMARY KEY ("customRequestId","accessGroupId")
);

-- AddForeignKey
ALTER TABLE "CustomRequest" ADD CONSTRAINT "CustomRequest_accessGroupId_fkey" FOREIGN KEY ("accessGroupId") REFERENCES "AccessGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequestsAndAccessGroups" ADD CONSTRAINT "CustomRequestsAndAccessGroups_customRequestId_fkey" FOREIGN KEY ("customRequestId") REFERENCES "CustomRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequestsAndAccessGroups" ADD CONSTRAINT "CustomRequestsAndAccessGroups_accessGroupId_fkey" FOREIGN KEY ("accessGroupId") REFERENCES "AccessGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
