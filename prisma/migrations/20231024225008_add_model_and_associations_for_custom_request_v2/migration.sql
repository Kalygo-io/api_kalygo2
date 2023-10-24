/*
  Warnings:

  - A unique constraint covering the columns `[accountId,summaryV3Id]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountId,customRequestV2Id]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "customRequestV2Id" INTEGER;

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "customRequestV2Id" INTEGER;

-- CreateTable
CREATE TABLE "CustomRequestV2" (
    "id" SERIAL NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "scanMode" "ScanningMode" NOT NULL DEFAULT 'PRIOR_TO_TRACKING_MODE',
    "model" TEXT,
    "bucket" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "completionResponse" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "CustomRequestV2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomRequestV2sAndAccessGroups" (
    "customRequestV2Id" INTEGER NOT NULL,
    "accessGroupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "CustomRequestV2sAndAccessGroups_pkey" PRIMARY KEY ("customRequestV2Id","accessGroupId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rating_accountId_summaryV3Id_key" ON "Rating"("accountId", "summaryV3Id");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_accountId_customRequestV2Id_key" ON "Rating"("accountId", "customRequestV2Id");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_customRequestV2Id_fkey" FOREIGN KEY ("customRequestV2Id") REFERENCES "CustomRequestV2"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_customRequestV2Id_fkey" FOREIGN KEY ("customRequestV2Id") REFERENCES "CustomRequestV2"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequestV2" ADD CONSTRAINT "CustomRequestV2_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequestV2sAndAccessGroups" ADD CONSTRAINT "CustomRequestV2sAndAccessGroups_customRequestV2Id_fkey" FOREIGN KEY ("customRequestV2Id") REFERENCES "CustomRequestV2"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequestV2sAndAccessGroups" ADD CONSTRAINT "CustomRequestV2sAndAccessGroups_accessGroupId_fkey" FOREIGN KEY ("accessGroupId") REFERENCES "AccessGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
