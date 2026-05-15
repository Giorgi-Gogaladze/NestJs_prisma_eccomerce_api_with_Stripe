/*
  Warnings:

  - The values [ADJUSTMENT] on the enum `InventoryChangeReason` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InventoryChangeReason_new" AS ENUM ('SALE', 'RETURN', 'CANCELLATION', 'RESTOCK', 'OTHER');
ALTER TABLE "InventoryLog" ALTER COLUMN "reason" TYPE "InventoryChangeReason_new" USING ("reason"::text::"InventoryChangeReason_new");
ALTER TYPE "InventoryChangeReason" RENAME TO "InventoryChangeReason_old";
ALTER TYPE "InventoryChangeReason_new" RENAME TO "InventoryChangeReason";
DROP TYPE "public"."InventoryChangeReason_old";
COMMIT;
