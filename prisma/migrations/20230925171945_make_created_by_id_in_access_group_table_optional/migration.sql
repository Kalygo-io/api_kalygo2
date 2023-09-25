-- DropForeignKey
ALTER TABLE "AccessGroup" DROP CONSTRAINT "AccessGroup_createdById_fkey";

-- AlterTable
ALTER TABLE "AccessGroup" ALTER COLUMN "createdById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "AccessGroup" ADD CONSTRAINT "AccessGroup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
