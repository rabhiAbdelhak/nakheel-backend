-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_updaterId_fkey";

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "creatorId" DROP NOT NULL,
ALTER COLUMN "updaterId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_updaterId_fkey" FOREIGN KEY ("updaterId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
