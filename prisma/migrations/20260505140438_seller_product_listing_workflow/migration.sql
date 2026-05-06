-- CreateEnum
CREATE TYPE "ProductCondition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('BUY_NOW', 'AUCTION', 'LIVE_ONLY');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "listingType" "ListingType" NOT NULL DEFAULT 'BUY_NOW',
ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brand" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "condition" "ProductCondition" NOT NULL DEFAULT 'NEW';
