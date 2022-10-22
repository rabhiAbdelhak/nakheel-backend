/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Depot` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Depot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Depot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Depot" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Depot_name_key" ON "Depot"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Depot_code_key" ON "Depot"("code");
