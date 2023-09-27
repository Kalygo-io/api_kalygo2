-- AlterTable
ALTER TABLE "File" ADD COLUMN     "accountContextId" INTEGER;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_accountContextId_fkey" FOREIGN KEY ("accountContextId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
