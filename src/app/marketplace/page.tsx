import { ListingCard } from "@/components/ListingCard";
import { EmptyState } from "@/components/EmptyState";
import { getActiveListings } from "@/lib/marketplace";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const listings = await getActiveListings();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Live commerce marketplace</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-ink md:text-6xl">Shop drops, auctions, and seller-hosted product moments.</h1>
        </div>
        <p className="text-base leading-7 text-black/60">
          Discover limited inventory listings from verified sellers, built for real-time streams, timed auctions, and premium checkout flows.
        </p>
      </section>

      <section className="mt-10 grid gap-4 border-y border-black/10 py-5 md:grid-cols-3">
        <div>
          <p className="text-2xl font-semibold text-ink">{listings.length}</p>
          <p className="text-sm text-black/55">active listings</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-ink">Live</p>
          <p className="text-sm text-black/55">stream-ready catalog</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-ink">Auction</p>
          <p className="text-sm text-black/55">bidding model included</p>
        </div>
      </section>

      <section className="mt-10">
        {listings.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                sellerName={listing.sellerProfile.shopName}
                category={listing.product.category.name}
                price={listing.price.toString()}
                quantity={listing.quantity}
                listingType={listing.listingType}
                imageUrl={listing.product.images[0]?.url}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No active listings yet" description="Run the Prisma seed to load sample sellers, products, listings, auctions, and streams." />
        )}
      </section>
    </main>
  );
}
