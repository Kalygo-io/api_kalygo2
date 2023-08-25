/*
  Warnings:

  - A unique constraint covering the columns `[name,createdById]` on the table `AccessGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AccessGroup_name_createdById_key" ON "AccessGroup"("name", "createdById");
