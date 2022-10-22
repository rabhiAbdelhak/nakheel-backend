/*
  Warnings:

  - You are about to drop the `PermissionsOnRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PermissionsOnRole" DROP CONSTRAINT "PermissionsOnRole_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "PermissionsOnRole" DROP CONSTRAINT "PermissionsOnRole_roleId_fkey";

-- DropTable
DROP TABLE "PermissionsOnRole";

-- CreateTable
CREATE TABLE "role_pemisisons" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "role_pemisisons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_pemisisons_roleId_permissionId_key" ON "role_pemisisons"("roleId", "permissionId");

-- AddForeignKey
ALTER TABLE "role_pemisisons" ADD CONSTRAINT "role_pemisisons_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_pemisisons" ADD CONSTRAINT "role_pemisisons_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
