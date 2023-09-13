/*
  Warnings:

  - A unique constraint covering the columns `[id,ownerId]` on the table `Prompt` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Prompt_id_ownerId_key" ON "Prompt"("id", "ownerId");
