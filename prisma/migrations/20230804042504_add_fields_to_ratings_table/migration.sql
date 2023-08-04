/*
  Warnings:

  - You are about to drop the column `ratingId` on the `Rating` table. All the data in the column will be lost.
  - Added the required column `rating` to the `Rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ratingMax` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "ratingId",
ADD COLUMN     "rating" INTEGER NOT NULL,
ADD COLUMN     "ratingMax" INTEGER NOT NULL;
