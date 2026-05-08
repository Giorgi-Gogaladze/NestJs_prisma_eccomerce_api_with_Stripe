/*
  Warnings:

  - Added the required column `resultingStock` to the `InventoryLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InventoryLog" ADD COLUMN     "orderId" UUID,
ADD COLUMN     "resultingStock" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "InventoryLog" ADD CONSTRAINT "InventoryLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
