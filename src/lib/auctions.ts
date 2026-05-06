import { AuctionStatus, ListingStatus, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class AuctionError extends Error {
  constructor(
    message: string,
    public code: string,
    public status = 400
  ) {
    super(message);
  }
}

const ANTI_SNIPING_WINDOW_MS = 30 * 1000;
const ANTI_SNIPING_EXTENSION_MS = 30 * 1000;

function decimalNumber(value: unknown) {
  return Number(value);
}

export async function getHighestBid(auctionId: string) {
  return prisma.bid.findFirst({
    where: { auctionId },
    include: { bidder: true },
    orderBy: [{ amount: "desc" }, { createdAt: "asc" }]
  });
}

export async function placeAuctionBid({
  auctionId,
  bidderId,
  amount
}: {
  auctionId: string;
  bidderId: string;
  amount: number;
}) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AuctionError("Enter a valid bid amount.", "INVALID_AMOUNT");
  }

  return prisma.$transaction(async (tx) => {
    const auction = await tx.auction.findUnique({
      where: { id: auctionId },
      include: {
        listing: {
          include: {
            sellerProfile: true
          }
        },
        bids: {
          orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
          take: 1
        }
      }
    });

    if (!auction || auction.listing.listingType !== "AUCTION") {
      throw new AuctionError("Auction not found.", "NOT_FOUND", 404);
    }

    const now = new Date();

    if (auction.status !== AuctionStatus.LIVE || auction.listing.status !== ListingStatus.ACTIVE || auction.startsAt > now || auction.endsAt <= now) {
      throw new AuctionError("Auction is not active.", "NOT_ACTIVE");
    }

    if (auction.listing.sellerProfile.userId === bidderId) {
      throw new AuctionError("Sellers cannot bid on their own items.", "SELLER_BID_FORBIDDEN", 403);
    }

    const highestBid = auction.bids[0];
    const currentPrice = highestBid ? decimalNumber(highestBid.amount) : decimalNumber(auction.currentPrice);
    const increment = decimalNumber(auction.bidIncrement);
    const minimumBid = currentPrice + increment;

    if (amount <= currentPrice) {
      throw new AuctionError("Bid must be higher than the current bid.", "BID_TOO_LOW");
    }

    if (amount < minimumBid) {
      throw new AuctionError(`Bid must meet the ${increment.toFixed(2)} increment.`, "INCREMENT_NOT_MET");
    }

    const extendedEndsAt = auction.endsAt.getTime() - now.getTime() <= ANTI_SNIPING_WINDOW_MS
      ? new Date(auction.endsAt.getTime() + ANTI_SNIPING_EXTENSION_MS)
      : auction.endsAt;

    const bid = await tx.bid.create({
      data: {
        auctionId,
        bidderId,
        amount
      },
      include: { bidder: true }
    });

    const updatedAuction = await tx.auction.update({
      where: { id: auctionId },
      data: {
        currentPrice: amount,
        endsAt: extendedEndsAt
      },
      include: {
        listing: true,
        bids: {
          include: { bidder: true },
          orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
          take: 5
        }
      }
    });

    return { bid, auction: updatedAuction, extended: extendedEndsAt.getTime() !== auction.endsAt.getTime() };
  });
}

export async function closeAuction(auctionId: string) {
  return prisma.$transaction(async (tx) => {
    const auction = await tx.auction.findUnique({
      where: { id: auctionId },
      include: {
        listing: { include: { product: true } },
        bids: {
          orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
          take: 1
        }
      }
    });

    if (!auction) {
      throw new AuctionError("Auction not found.", "NOT_FOUND", 404);
    }

    if (auction.endsAt > new Date() && auction.status !== AuctionStatus.ENDED) {
      throw new AuctionError("Auction has not ended yet.", "NOT_ENDED");
    }

    if (auction.status === AuctionStatus.ENDED && auction.settlementOrderId) {
      return { closed: false, orderId: auction.settlementOrderId };
    }

    const winningBid = auction.bids[0];

    if (!winningBid) {
      await tx.auction.update({
        where: { id: auction.id },
        data: { status: AuctionStatus.ENDED, closedAt: new Date() }
      });
      await tx.listing.update({
        where: { id: auction.listingId },
        data: { status: ListingStatus.ENDED }
      });
      return { closed: true, orderId: null };
    }

    const amount = decimalNumber(winningBid.amount);
    const order = await tx.order.create({
      data: {
        buyerId: winningBid.bidderId,
        status: OrderStatus.PENDING,
        subtotal: amount,
        shipping: 0,
        tax: 0,
        platformFee: 0,
        sellerProceeds: amount,
        total: amount,
        items: {
          create: {
            listingId: auction.listingId,
            productId: auction.listing.productId,
            quantity: 1,
            unitPrice: amount,
            total: amount
          }
        }
      }
    });

    await tx.auction.update({
      where: { id: auction.id },
      data: {
        status: AuctionStatus.ENDED,
        closedAt: new Date(),
        winningBidId: winningBid.id,
        settlementOrderId: order.id
      }
    });

    await tx.listing.update({
      where: { id: auction.listingId },
      data: {
        status: ListingStatus.ENDED,
        quantity: 0
      }
    });

    await tx.product.update({
      where: { id: auction.listing.productId },
      data: {
        inventory: { decrement: Math.min(auction.listing.product.inventory, 1) }
      }
    });

    return { closed: true, orderId: order.id };
  });
}

export async function closeEndedAuctions() {
  const ended = await prisma.auction.findMany({
    where: {
      status: AuctionStatus.LIVE,
      endsAt: { lte: new Date() }
    },
    select: { id: true }
  });

  const results = [];

  for (const auction of ended) {
    results.push(await closeAuction(auction.id));
  }

  return results;
}
