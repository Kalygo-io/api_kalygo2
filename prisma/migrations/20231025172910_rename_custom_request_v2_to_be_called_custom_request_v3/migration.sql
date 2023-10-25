/*
  Warnings:

  - You are about to drop the column `customRequestV2Id` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `customRequestV2Id` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the `CustomRequestV2` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomRequestV2sAndAccessGroups` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[accountId,customRequestV3Id]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "RatingType" ADD VALUE 'CustomRequestV3';

-- DropForeignKey
ALTER TABLE "CustomRequestV2" DROP CONSTRAINT "CustomRequestV2_requesterId_fkey";

-- DropForeignKey
ALTER TABLE "CustomRequestV2sAndAccessGroups" DROP CONSTRAINT "CustomRequestV2sAndAccessGroups_accessGroupId_fkey";

-- DropForeignKey
ALTER TABLE "CustomRequestV2sAndAccessGroups" DROP CONSTRAINT "CustomRequestV2sAndAccessGroups_customRequestV2Id_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_customRequestV2Id_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_customRequestV2Id_fkey";

-- DropIndex
DROP INDEX "Rating_accountId_customRequestV2Id_key";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "customRequestV2Id",
ADD COLUMN     "customRequestV3Id" INTEGER;

-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "customRequestV2Id",
ADD COLUMN     "customRequestV3Id" INTEGER;

-- DropTable
DROP TABLE "CustomRequestV2";

-- DropTable
DROP TABLE "CustomRequestV2sAndAccessGroups";

-- CreateTable
CREATE TABLE "CustomRequestV3" (
    "id" SERIAL NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "scanMode" "ScanningMode" NOT NULL DEFAULT 'PRIOR_TO_TRACKING_MODE',
    "model" TEXT,
    "prompt" TEXT NOT NULL,
    "completionResponse" JSONB NOT NULL,
    "batchId" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "CustomRequestV3_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomRequestV3sAndAccessGroups" (
    "customRequestV3Id" INTEGER NOT NULL,
    "accessGroupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "CustomRequestV3sAndAccessGroups_pkey" PRIMARY KEY ("customRequestV3Id","accessGroupId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rating_accountId_customRequestV3Id_key" ON "Rating"("accountId", "customRequestV3Id");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_customRequestV3Id_fkey" FOREIGN KEY ("customRequestV3Id") REFERENCES "CustomRequestV3"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_customRequestV3Id_fkey" FOREIGN KEY ("customRequestV3Id") REFERENCES "CustomRequestV3"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequestV3" ADD CONSTRAINT "CustomRequestV3_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequestV3sAndAccessGroups" ADD CONSTRAINT "CustomRequestV3sAndAccessGroups_customRequestV3Id_fkey" FOREIGN KEY ("customRequestV3Id") REFERENCES "CustomRequestV3"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequestV3sAndAccessGroups" ADD CONSTRAINT "CustomRequestV3sAndAccessGroups_accessGroupId_fkey" FOREIGN KEY ("accessGroupId") REFERENCES "AccessGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
