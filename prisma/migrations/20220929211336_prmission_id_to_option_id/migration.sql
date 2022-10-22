/*
  Warnings:

  - You are about to drop the column `permissionId` on the `permissions` table. All the data in the column will be lost.
  - Added the required column `optionId` to the `permissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "permissions" DROP CONSTRAINT "permissions_permissionId_fkey";

-- AlterTable
ALTER TABLE "permissions" DROP COLUMN "permissionId",
ADD COLUMN     "optionId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
