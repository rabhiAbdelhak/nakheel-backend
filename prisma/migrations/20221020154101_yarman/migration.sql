-- DropForeignKey
ALTER TABLE "lots" DROP CONSTRAINT "lots_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "lots" DROP CONSTRAINT "lots_updaterId_fkey";

-- AlterTable
ALTER TABLE "lots" ALTER COLUMN "unitCost" DROP NOT NULL,
ALTER COLUMN "creatorId" DROP NOT NULL,
ALTER COLUMN "updaterId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_updaterId_fkey" FOREIGN KEY ("updaterId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
