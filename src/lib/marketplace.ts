import { ListingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getActiveListings() {
  return prisma.listing.findMany({
    where: { status: ListingStatus.ACTIVE },
    include: {
      auction: true,
      sellerProfile: true,
      product: {
        include: {
          category: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1 }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getListingById(listingId: string) {
  return prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      auction: { include: { bids: { orderBy: { createdAt: "desc" }, take: 5 } } },
      sellerProfile: { include: { user: true } },
      product: {
        include: {
          category: true,
          images: { orderBy: { sortOrder: "asc" } }
        }
      },
      liveProducts: {
        include: {
          liveStream: true
        }
      }
    }
  });
}

export async function getSellerDashboardData(sellerProfileId?: string) {
  if (!sellerProfileId) {
    return null;
  }

  const seller = await prisma.sellerProfile.findUnique({
    where: { id: sellerProfileId },
    include: {
      products: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, category: true } },
      listings: { include: { product: { include: { images: { take: 1 }, category: true } }, auction: true } },
      liveStreams: true
    }
  });

  return seller;
}

export async function getSellerProductOptions(sellerProfileId?: string) {
  if (!sellerProfileId) {
    return [];
  }

  return prisma.product.findMany({
    where: { sellerProfileId },
    include: { category: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function getAdminMetrics() {
  const [users, listings, orders, streams] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.order.count(),
    prisma.liveStream.count()
  ]);

  return { users, listings, orders, streams };
}
