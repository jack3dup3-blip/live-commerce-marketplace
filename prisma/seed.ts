import { ListingType, PrismaClient, ListingStatus, ProductCondition, UserRole, StreamStatus } from "@prisma/client";
import { createPasswordHash } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  await prisma.liveProduct.deleteMany();
  await prisma.liveStream.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.user.deleteMany();

  const [buyer, sellerUser, adminUser] = await Promise.all([
    prisma.user.create({
      data: { name: "Maya Chen", email: "maya@example.com", passwordHash: createPasswordHash("buyer123"), role: UserRole.BUYER }
    }),
    prisma.user.create({
      data: { name: "Theo Ramirez", email: "theo@ateliergoods.test", passwordHash: createPasswordHash("seller123"), role: UserRole.SELLER }
    }),
    prisma.user.create({
      data: { name: "Admin Lee", email: "admin@market.test", passwordHash: createPasswordHash("admin123"), role: UserRole.ADMIN }
    })
  ]);

  const seller = await prisma.sellerProfile.create({
    data: {
      userId: sellerUser.id,
      shopName: "Atelier Goods Live",
      slug: "atelier-goods-live",
      bio: "Curated design objects, limited drops, and live auction events.",
      rating: 4.86
    }
  });

  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Home Studio", slug: "home-studio" } }),
    prisma.category.create({ data: { name: "Collectibles", slug: "collectibles" } }),
    prisma.category.create({ data: { name: "Beauty Tech", slug: "beauty-tech" } })
  ]);

  const productData = [
    {
      name: "Ceramic Pour-Over Set",
      slug: "ceramic-pour-over-set",
      sku: "AGS-POUR-001",
      brand: "Atelier Goods",
      condition: ProductCondition.NEW,
      price: 84,
      compareAtPrice: 110,
      inventory: 24,
      categoryId: categories[0].id,
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Numbered Vinyl Archive Box",
      slug: "numbered-vinyl-archive-box",
      sku: "AGS-VINYL-002",
      brand: "Archive Line",
      condition: ProductCondition.LIKE_NEW,
      price: 148,
      compareAtPrice: null,
      inventory: 8,
      categoryId: categories[1].id,
      image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "LED Vanity Mirror Pro",
      slug: "led-vanity-mirror-pro",
      sku: "AGS-MIRROR-003",
      brand: "Glow Haus",
      condition: ProductCondition.NEW,
      price: 129,
      compareAtPrice: 169,
      inventory: 17,
      categoryId: categories[2].id,
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  const products = await Promise.all(
    productData.map((item, index) =>
      prisma.product.create({
        data: {
          sellerProfileId: seller.id,
          categoryId: item.categoryId,
          name: item.name,
          slug: item.slug,
          description: `${item.name} prepared for live commerce drops with premium packaging and fast fulfillment.`,
          sku: item.sku,
          brand: item.brand,
          condition: item.condition,
          price: item.price,
          compareAtPrice: item.compareAtPrice,
          inventory: item.inventory,
          images: {
            create: {
              url: item.image,
              alt: item.name,
              sortOrder: index
            }
          }
        }
      })
    )
  );

  const listings = await Promise.all(
    products.map((product, index) =>
      prisma.listing.create({
        data: {
          productId: product.id,
          sellerProfileId: seller.id,
          title: `${product.name} Live Drop`,
          slug: `${product.slug}-live-drop`,
          listingType: index === 1 ? ListingType.AUCTION : ListingType.BUY_NOW,
          description: `Limited inventory listing for ${product.name}. Includes live chat support and seller-hosted demo.`,
          price: product.price,
          quantity: Math.min(product.inventory, 10),
          status: ListingStatus.ACTIVE,
          startsAt: new Date(Date.now() - 1000 * 60 * 60 * (index + 1)),
          endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * (index + 3))
        }
      })
    )
  );

  const auction = await prisma.auction.create({
    data: {
      listingId: listings[1].id,
      status: "LIVE",
      startingPrice: 90,
      currentPrice: 132,
      bidIncrement: 5,
      reservePrice: 120,
      startsAt: new Date(Date.now() - 1000 * 60 * 30),
      endsAt: new Date(Date.now() + 1000 * 60 * 90)
    }
  });

  await prisma.bid.create({
    data: {
      auctionId: auction.id,
      bidderId: buyer.id,
      amount: 132
    }
  });

  const liveStream = await prisma.liveStream.create({
    data: {
      sellerProfileId: seller.id,
      title: "Saturday Studio Drop",
      slug: "saturday-studio-drop",
      status: StreamStatus.LIVE,
      thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      startsAt: new Date(Date.now() - 1000 * 60 * 20)
    }
  });

  await Promise.all(
    products.map((product, index) =>
      prisma.liveProduct.create({
        data: {
          liveStreamId: liveStream.id,
          productId: product.id,
          listingId: listings[index]?.id,
          sortOrder: index,
          isFeatured: index === 0
        }
      })
    )
  );

  await prisma.order.create({
    data: {
      buyerId: buyer.id,
      status: "PAID",
      subtotal: 84,
      shipping: 8,
      tax: 6.72,
      total: 98.72,
      items: {
        create: {
          listingId: listings[0].id,
          productId: products[0].id,
          quantity: 1,
          unitPrice: 84,
          total: 84
        }
      }
    }
  });

  console.log(`Seeded ${products.length} products, ${listings.length} listings, and users: ${buyer.email}, ${sellerUser.email}, ${adminUser.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
