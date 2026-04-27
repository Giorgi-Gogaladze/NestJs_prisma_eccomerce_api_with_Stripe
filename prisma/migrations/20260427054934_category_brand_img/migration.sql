/*
  Warnings:

  - You are about to drop the column `logoUrl` on the `brands` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "brands" DROP COLUMN "logoUrl",
ADD COLUMN     "logoImg" TEXT;
