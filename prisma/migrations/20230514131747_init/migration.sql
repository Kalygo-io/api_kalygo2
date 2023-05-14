-- CreateTable
CREATE TABLE "Film" (
    "code" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,

    CONSTRAINT "Film_pkey" PRIMARY KEY ("code")
);
