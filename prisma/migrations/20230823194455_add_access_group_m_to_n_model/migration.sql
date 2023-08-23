-- CreateTable
CREATE TABLE "AccessGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "AccessGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AccessGroupToAccount" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AccessGroupToFile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AccessGroupToSummaryV2" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AccessGroupToCustomRequest" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AccessGroupToAccount_AB_unique" ON "_AccessGroupToAccount"("A", "B");

-- CreateIndex
CREATE INDEX "_AccessGroupToAccount_B_index" ON "_AccessGroupToAccount"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AccessGroupToFile_AB_unique" ON "_AccessGroupToFile"("A", "B");

-- CreateIndex
CREATE INDEX "_AccessGroupToFile_B_index" ON "_AccessGroupToFile"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AccessGroupToSummaryV2_AB_unique" ON "_AccessGroupToSummaryV2"("A", "B");

-- CreateIndex
CREATE INDEX "_AccessGroupToSummaryV2_B_index" ON "_AccessGroupToSummaryV2"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AccessGroupToCustomRequest_AB_unique" ON "_AccessGroupToCustomRequest"("A", "B");

-- CreateIndex
CREATE INDEX "_AccessGroupToCustomRequest_B_index" ON "_AccessGroupToCustomRequest"("B");

-- AddForeignKey
ALTER TABLE "_AccessGroupToAccount" ADD CONSTRAINT "_AccessGroupToAccount_A_fkey" FOREIGN KEY ("A") REFERENCES "AccessGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessGroupToAccount" ADD CONSTRAINT "_AccessGroupToAccount_B_fkey" FOREIGN KEY ("B") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessGroupToFile" ADD CONSTRAINT "_AccessGroupToFile_A_fkey" FOREIGN KEY ("A") REFERENCES "AccessGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessGroupToFile" ADD CONSTRAINT "_AccessGroupToFile_B_fkey" FOREIGN KEY ("B") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessGroupToSummaryV2" ADD CONSTRAINT "_AccessGroupToSummaryV2_A_fkey" FOREIGN KEY ("A") REFERENCES "AccessGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessGroupToSummaryV2" ADD CONSTRAINT "_AccessGroupToSummaryV2_B_fkey" FOREIGN KEY ("B") REFERENCES "SummaryV2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessGroupToCustomRequest" ADD CONSTRAINT "_AccessGroupToCustomRequest_A_fkey" FOREIGN KEY ("A") REFERENCES "AccessGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessGroupToCustomRequest" ADD CONSTRAINT "_AccessGroupToCustomRequest_B_fkey" FOREIGN KEY ("B") REFERENCES "CustomRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
