/*
  Warnings:

  - A unique constraint covering the columns `[accountForPictureId]` on the table `File` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "accountForPictureId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "File_accountForPictureId_key" ON "File"("accountForPictureId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_accountForPictureId_fkey" FOREIGN KEY ("accountForPictureId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
