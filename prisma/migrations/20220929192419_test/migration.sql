/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `modules` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `options` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "modules_title_key" ON "modules"("title");

-- CreateIndex
CREATE UNIQUE INDEX "options_name_key" ON "options"("name");
