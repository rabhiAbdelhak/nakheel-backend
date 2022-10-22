/*
  Warnings:

  - A unique constraint covering the columns `[optionId,moduleId]` on the table `options_module` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roleId,userId]` on the table `roles_user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "options_module_optionId_moduleId_idx";

-- DropIndex
DROP INDEX "roles_user_roleId_userId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "options_module_optionId_moduleId_key" ON "options_module"("optionId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_user_roleId_userId_key" ON "roles_user"("roleId", "userId");
