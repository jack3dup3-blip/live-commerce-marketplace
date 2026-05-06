import { expect, test } from "@playwright/test";
import { AuctionStatus, ListingStatus, ListingType, ProductCondition, UserRole } from "@prisma/client";
import { AuctionError, closeAuction, placeAuctionBid } from "../src/lib/auctions";
import { prisma } from "../src/lib/prisma";

async function createAuctionFixture({ finalSeconds = 3600 }: { finalSeconds?: number } = {}) {
  const suffix = `${Date.now()}-${Math.round(Math.random() * 100000)}`;
  const [sellerUser, buyerOne, buyerTwo, category] = await Promise.all([
    prisma.user.create({
      data: {
        name: `Auction Seller ${suffix}`,
        email: `auction-seller-${suffix}@example.com`,
        role: UserRole.SELLER,
        passwordHash: "test"
      }
    }),
    prisma.user.create({
      data: {
        name: `Auction Buyer One ${suffix}`,
        email: `auction-buyer-one-${suffix}@example.com`,
        role: UserRole.BUYER,
        passwordHash: "test"
      }
    }),
    prisma.user.create({
      data: {
        name: `Auction Buyer Two ${suffix}`,
        email: `auction-buyer-two-${suffix}@example.com`,
        role: UserRole.BUYER,
        passwordHash: "test"
      }
    }),
    prisma.category.create({
      data: {
        name: `Auction Category ${suffix}`,
        slug: `auction-category-${suffix}`
      }
    })
  ]);

  const sellerProfile = await prisma.sellerProfile.create({
    data: {
      userId: sellerUser.id,
      shopName: `Auction Shop ${suffix}`,
      slug: `auction-shop-${suffix}`
    }
  });

  const product = await prisma.product.create({
    data: {
      sellerProfileId: sellerProfile.id,
      categoryId: category.id,
      name: `Auction Product ${suffix}`,
      slug: `auction-product-${suffix}`,
      brand: "Test Brand",
      condition: ProductCondition.NEW,
      description: "Auction test product with enough detail for validation.",
      sku: `auction-sku-${suffix}`,
      price: 0,
      inventory: 3
    }
  });

  const listing = await prisma.listing.create({
    data: {
      productId: product.id,
      sellerProfileId: sellerProfile.id,
      title: `Auction Listing ${suffix}`,
      slug: `auction-listing-${suffix}`,
      listingType: ListingType.AUCTION,
      description: "Auction test listing with enough detail for bidding.",
      price: 100,
      quantity: 1,
      status: ListingStatus.ACTIVE,
      startsAt: new Date(Date.now() - 60_000),
      endsAt: new Date(Date.now() + finalSeconds * 1000)
    }
  });

  const auction = await prisma.auction.create({
    data: {
      listingId: listing.id,
      status: AuctionStatus.LIVE,
      startingPrice: 100,
      currentPrice: 100,
      bidIncrement: 10,
      startsAt: new Date(Date.now() - 60_000),
      endsAt: new Date(Date.now() + finalSeconds * 1000)
    }
  });

  return { sellerUser, buyerOne, buyerTwo, auction, listing, product };
}

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("validates bids and determines highest bid server-side", async () => {
  const fixture = await createAuctionFixture();

  await expect(placeAuctionBid({ auctionId: fixture.auction.id, bidderId: fixture.sellerUser.id, amount: 120 }))
    .rejects
    .toMatchObject({ code: "SELLER_BID_FORBIDDEN" });

  await expect(placeAuctionBid({ auctionId: fixture.auction.id, bidderId: fixture.buyerOne.id, amount: 105 }))
    .rejects
    .toMatchObject({ code: "INCREMENT_NOT_MET" });

  const firstBid = await placeAuctionBid({ auctionId: fixture.auction.id, bidderId: fixture.buyerOne.id, amount: 110 });
  expect(firstBid.auction.currentPrice.toString()).toBe("110");

  await expect(placeAuctionBid({ auctionId: fixture.auction.id, bidderId: fixture.buyerTwo.id, amount: 115 }))
    .rejects
    .toMatchObject({ code: "INCREMENT_NOT_MET" });

  const secondBid = await placeAuctionBid({ auctionId: fixture.auction.id, bidderId: fixture.buyerTwo.id, amount: 130 });
  expect(secondBid.auction.bids[0].bidderId).toBe(fixture.buyerTwo.id);
  expect(secondBid.auction.currentPrice.toString()).toBe("130");
});

test("extends auction by 30 seconds for final-window bids", async () => {
  const fixture = await createAuctionFixture({ finalSeconds: 20 });
  const originalEndsAt = fixture.auction.endsAt.getTime();
  const result = await placeAuctionBid({ auctionId: fixture.auction.id, bidderId: fixture.buyerOne.id, amount: 110 });

  expect(result.extended).toBe(true);
  expect(result.auction.endsAt.getTime()).toBe(originalEndsAt + 30_000);
});

test("locks ended auction and creates pending order for winner", async () => {
  const fixture = await createAuctionFixture();
  await placeAuctionBid({ auctionId: fixture.auction.id, bidderId: fixture.buyerOne.id, amount: 110 });
  const winningBid = await placeAuctionBid({ auctionId: fixture.auction.id, bidderId: fixture.buyerTwo.id, amount: 130 });

  await prisma.auction.update({
    where: { id: fixture.auction.id },
    data: { endsAt: new Date(Date.now() - 1000) }
  });

  const closeResult = await closeAuction(fixture.auction.id);
  expect(closeResult.closed).toBe(true);
  expect(closeResult.orderId).toBeTruthy();

  const auction = await prisma.auction.findUniqueOrThrow({ where: { id: fixture.auction.id } });
  expect(auction.status).toBe(AuctionStatus.ENDED);
  expect(auction.winningBidId).toBe(winningBid.bid.id);

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: closeResult.orderId ?? "" },
    include: { items: true }
  });

  expect(order.status).toBe("PENDING");
  expect(order.buyerId).toBe(fixture.buyerTwo.id);
  expect(order.items).toHaveLength(1);
  expect(order.items[0].total.toString()).toBe("130");
});

test("does not close a live auction before end time", async () => {
  const fixture = await createAuctionFixture();

  await expect(closeAuction(fixture.auction.id))
    .rejects
    .toBeInstanceOf(AuctionError);
});
