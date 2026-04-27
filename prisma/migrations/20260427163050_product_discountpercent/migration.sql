/*
  Warnings:

  - You are about to drop the column `discountPrice` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "discountPrice",
ADD COLUMN     "discountPercent" INTEGER DEFAULT 0;
