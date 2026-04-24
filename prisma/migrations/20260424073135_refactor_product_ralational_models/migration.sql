/*
  Warnings:

  - You are about to drop the column `attributes` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `product_attributes` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `basePrice` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "product_attributes" DROP CONSTRAINT "product_attributes_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "product_attributes" DROP CONSTRAINT "product_attributes_productId_fkey";

-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "attributes";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "price",
ADD COLUMN     "basePrice" DECIMAL(10,2) NOT NULL;

-- DropTable
DROP TABLE "product_attributes";

-- CreateTable
CREATE TABLE "attribute_values" (
    "id" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "attributeId" UUID NOT NULL,
    "productId" UUID NOT NULL,

    CONSTRAINT "attribute_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AttributeValueToProductVariant" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_AttributeValueToProductVariant_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "attribute_values_value_attributeId_productId_key" ON "attribute_values"("value", "attributeId", "productId");

-- CreateIndex
CREATE INDEX "_AttributeValueToProductVariant_B_index" ON "_AttributeValueToProductVariant"("B");

-- AddForeignKey
ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeValueToProductVariant" ADD CONSTRAINT "_AttributeValueToProductVariant_A_fkey" FOREIGN KEY ("A") REFERENCES "attribute_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttributeValueToProductVariant" ADD CONSTRAINT "_AttributeValueToProductVariant_B_fkey" FOREIGN KEY ("B") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
