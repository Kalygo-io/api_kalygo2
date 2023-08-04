-- CreateEnum
CREATE TYPE "RatingType" AS ENUM ('SummaryV2', 'CustomRequest');

-- CreateTable
CREATE TABLE "Rating" (
    "id" SERIAL NOT NULL,
    "ratingType" "RatingType" NOT NULL DEFAULT 'SummaryV2',
    "ratingId" INTEGER NOT NULL,
    "summaryV2Id" INTEGER,
    "customRequestId" INTEGER,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_summaryV2Id_fkey" FOREIGN KEY ("summaryV2Id") REFERENCES "SummaryV2"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_customRequestId_fkey" FOREIGN KEY ("customRequestId") REFERENCES "CustomRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
