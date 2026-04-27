/*
  Warnings:

  - Added the required column `imagePublicId` to the `product_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product_images" ADD COLUMN     "imagePublicId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "thumbnailPublicId" TEXT;
