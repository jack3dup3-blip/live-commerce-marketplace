-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "settlementOrderId" TEXT,
ADD COLUMN     "winningBidId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Auction_winningBidId_key" ON "Auction"("winningBidId");

-- CreateIndex
CREATE UNIQUE INDEX "Auction_settlementOrderId_key" ON "Auction"("settlementOrderId");
