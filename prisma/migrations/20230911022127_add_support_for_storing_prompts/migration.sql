/*
  Warnings:

  - You are about to drop the column `accessGroupId` on the `CustomRequest` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountId,promptId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "CustomRequest" DROP CONSTRAINT "CustomRequest_accessGroupId_fkey";

-- AlterTable
ALTER TABLE "CustomRequest" DROP COLUMN "accessGroupId";

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "promptId" INTEGER;

-- CreateTable
CREATE TABLE "Prompt" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptsAndAccessGroups" (
    "promptId" INTEGER NOT NULL,
    "accessGroupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "PromptsAndAccessGroups_pkey" PRIMARY KEY ("promptId","accessGroupId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rating_accountId_promptId_key" ON "Rating"("accountId", "promptId");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptsAndAccessGroups" ADD CONSTRAINT "PromptsAndAccessGroups_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptsAndAccessGroups" ADD CONSTRAINT "PromptsAndAccessGroups_accessGroupId_fkey" FOREIGN KEY ("accessGroupId") REFERENCES "AccessGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
