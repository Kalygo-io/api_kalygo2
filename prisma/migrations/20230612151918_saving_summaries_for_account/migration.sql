-- CreateTable
CREATE TABLE "Summary" (
    "id" SERIAL NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Summary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
