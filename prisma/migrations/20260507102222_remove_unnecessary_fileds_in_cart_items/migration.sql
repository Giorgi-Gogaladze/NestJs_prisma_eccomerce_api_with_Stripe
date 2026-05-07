/*
  Warnings:

  - You are about to drop the column `selectedColor` on the `cart_items` table. All the data in the column will be lost.
  - You are about to drop the column `selectedSize` on the `cart_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cart_items" DROP COLUMN "selectedColor",
DROP COLUMN "selectedSize";
