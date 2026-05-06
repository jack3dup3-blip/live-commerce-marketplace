import { notFound } from "next/navigation";
import { ListingForm } from "@/components/ListingForm";
import { requireSellerTools } from "@/lib/auth";
import { getSellerProductOptions } from "@/lib/marketplace";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditListingPage({ params }: { params: Promise<{ listingId: string }> }) {
  const user = await requireSellerTools();
  const { listingId } = await params;

  if (!user.sellerProfileId) {
    notFound();
  }

  const [products, listing] = await Promise.all([
    getSellerProductOptions(user.sellerProfileId),
    prisma.listing.findFirst({
      where: { id: listingId, sellerProfileId: user.sellerProfileId },
      include: { auction: true }
    })
  ]);

  if (!listing) {
    notFound();
  }

  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Marketplace supply</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">Edit listing</h1>
      <div className="mt-6">
        <ListingForm
          products={products.map((product) => ({
            id: product.id,
            name: product.name,
            inventory: product.inventory,
            brand: product.brand,
            condition: product.condition,
            category: { name: product.category.name }
          }))}
          listing={{
            id: listing.id,
            productId: listing.productId,
            title: listing.title,
            description: listing.description,
            listingType: listing.listingType,
            price: listing.price.toString(),
            quantity: listing.quantity,
            status: listing.status === "SOLD_OUT" || listing.status === "ENDED" ? "DRAFT" : listing.status,
            startingPrice: listing.auction?.startingPrice.toString(),
            bidIncrement: listing.auction?.bidIncrement.toString(),
            antiSnipingEnabled: listing.auction?.antiSnipingEnabled ?? false,
            startTime: listing.auction?.startsAt.toISOString() ?? listing.startsAt?.toISOString(),
            endTime: listing.auction?.endsAt.toISOString() ?? listing.endsAt?.toISOString()
          }}
        />
      </div>
    </section>
  );
}
