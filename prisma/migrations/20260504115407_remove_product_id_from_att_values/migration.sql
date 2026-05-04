/*
  Warnings:

  - You are about to drop the column `productId` on the `attribute_values` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[value,attributeId]` on the table `attribute_values` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "attribute_values" DROP CONSTRAINT "attribute_values_productId_fkey";

-- DropIndex
DROP INDEX "attribute_values_value_attributeId_productId_key";

-- AlterTable
ALTER TABLE "attribute_values" DROP COLUMN "productId";

-- CreateIndex
CREATE UNIQUE INDEX "attribute_values_value_attributeId_key" ON "attribute_values"("value", "attributeId");
