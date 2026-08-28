/*
  Warnings:

  - A unique constraint covering the columns `[guestId]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "guestId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "guestId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Cart_guestId_key" ON "Cart"("guestId");

-- CreateIndex
CREATE INDEX "Cart_guestId_idx" ON "Cart"("guestId");

-- CreateIndex
CREATE INDEX "Order_guestId_idx" ON "Order"("guestId");
