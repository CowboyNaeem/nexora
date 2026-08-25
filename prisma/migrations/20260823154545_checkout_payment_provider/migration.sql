/*
  Warnings:

  - Added the required column `division` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingDivision` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "division" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingDivision" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "provider" TEXT;

-- CreateIndex
CREATE INDEX "Payment_provider_idx" ON "Payment"("provider");
