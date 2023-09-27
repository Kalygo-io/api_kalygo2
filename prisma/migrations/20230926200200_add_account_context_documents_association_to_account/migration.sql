-- AlterTable
ALTER TABLE "File" ADD COLUMN     "accountId" INTEGER;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
