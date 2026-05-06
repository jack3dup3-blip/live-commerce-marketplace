import Link from "next/link";
import { Gavel, Radio, Search, ShieldCheck, ShoppingBag, Sparkles, Timer } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { EmptyState } from "@/components/EmptyState";
import { getActiveListings } from "@/lib/marketplace";
import { formatCurrency, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type MarketplacePageProps = {
  searchParams: Promise<{ q?: string; category?: string; type?: string }>;
};

const typeLabels = {
  BUY_NOW: "Buy now",
  AUCTION: "Auctions",
  LIVE_ONLY: "Live only"
} as const;

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const [{ q, category, type }, listings] = await Promise.all([searchParams, getActiveListings()]);
  const query = q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const categories = Array.from(new Set(listings.map((listing) => listing.product.category.name)));
  const auctionListings = listings.filter((listing) => listing.listingType === "AUCTION");
  const liveListings = listings.filter((listing) => listing.listingType === "LIVE_ONLY");
  const endingSoon = [...auctionListings].sort((a, b) => Number(a.auction?.endsAt ?? 0) - Number(b.auction?.endsAt ?? 0)).slice(0, 4);
  const featuredListing = listings[0];
  const filteredListings = listings.filter((listing) => {
    const matchesQuery = normalizedQuery
      ? [
          listing.title,
          listing.description,
          listing.product.name,
          listing.product.brand,
          listing.product.category.name,
          listing.sellerProfile.shopName
        ].join(" ").toLowerCase().includes(normalizedQuery)
      : true;
    const matchesCategory = category ? listing.product.category.name === category : true;
    const matchesType = type ? listing.listingType === type : true;

    return matchesQuery && matchesCategory && matchesType;
  });

  return (
    <main>
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <form action="/marketplace" className="grid gap-3 lg:grid-cols-[220px_1fr_120px]">
            <select name="category" defaultValue={category ?? ""} className="h-12 rounded-full border border-black/20 bg-white px-4 text-sm font-medium text-ink outline-none ring-lagoon/20 focus:ring-4">
              <option value="">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <label className="relative" htmlFor="marketplace-search">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-black/45" aria-hidden />
              <input
                id="marketplace-search"
                name="q"
                defaultValue={query}
                placeholder="Search for drops, auctions, collectibles, brands, and sellers"
                className="h-12 w-full rounded-full border border-black/20 bg-white px-14 text-sm outline-none ring-lagoon/20 focus:ring-4"
              />
            </label>
            <button className="h-12 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-ink" type="submit">Search</button>
          </form>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1 text-sm font-medium text-black/65">
            <Link href="/marketplace" className="shrink-0 rounded-full border border-black/10 px-4 py-2 hover:border-lagoon hover:text-ink">All</Link>
            <Link href="/marketplace?type=AUCTION" className="shrink-0 rounded-full border border-black/10 px-4 py-2 hover:border-lagoon hover:text-ink">Auctions</Link>
            <Link href="/marketplace?type=BUY_NOW" className="shrink-0 rounded-full border border-black/10 px-4 py-2 hover:border-lagoon hover:text-ink">Buy now</Link>
            <Link href="/marketplace?type=LIVE_ONLY" className="shrink-0 rounded-full border border-black/10 px-4 py-2 hover:border-lagoon hover:text-ink">Live only</Link>
            {categories.map((item) => (
              <Link key={item} href={`/marketplace?category=${encodeURIComponent(item)}`} className="shrink-0 rounded-full border border-black/10 px-4 py-2 hover:border-lagoon hover:text-ink">{item}</Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:px-8">
        <div className="overflow-hidden rounded-lg bg-ink text-white shadow-soft">
          <div className="grid min-h-[360px] gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_280px] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-amber-300" aria-hidden />
                Featured marketplace
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">Find live drops, timed auctions, and trusted seller inventory.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">
                Search broad like eBay, bid with the urgency of an auction house, and jump into seller-hosted product moments from one marketplace.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="#ending-soon" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-lagoon hover:text-white">Ending soon</Link>
                <Link href="/seller/listings/new" className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Start selling</Link>
              </div>
            </div>
            {featuredListing ? (
              <Link href={`/marketplace/${featuredListing.id}`} className="rounded-lg bg-white p-4 text-ink shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lagoon">Featured lot</p>
                <h2 className="mt-2 line-clamp-3 text-xl font-semibold">{featuredListing.title}</h2>
                <p className="mt-3 text-sm text-black/55">{featuredListing.sellerProfile.shopName}</p>
                <div className="mt-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-black/55">{featuredListing.listingType === "AUCTION" ? "Current bid" : "Price"}</p>
                    <p className="text-2xl font-semibold">{featuredListing.listingType === "LIVE_ONLY" ? "Live only" : formatCurrency(featuredListing.auction?.currentPrice?.toString() ?? featuredListing.price.toString())}</p>
                  </div>
                  <span className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">View</span>
                </div>
              </Link>
            ) : null}
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-lg border border-black/10 bg-white p-5 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lagoon">Marketplace pulse</p>
            <div className="mt-5 grid gap-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-black/60"><ShoppingBag className="h-4 w-4 text-lagoon" aria-hidden /> Active listings</span>
                <strong className="text-ink">{listings.length}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-black/60"><Gavel className="h-4 w-4 text-ember" aria-hidden /> Auctions</span>
                <strong className="text-ink">{auctionListings.length}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-black/60"><Radio className="h-4 w-4 text-lagoon" aria-hidden /> Live-ready</span>
                <strong className="text-ink">{liveListings.length}</strong>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-black/10 bg-white p-5 shadow-soft">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ShieldCheck className="h-4 w-4 text-lagoon" aria-hidden />
              Buyer protection
            </p>
            <p className="mt-2 text-sm leading-6 text-black/60">Stripe test checkout, protected bidding rules, seller profiles, and pending order creation are wired for the core flows.</p>
          </div>
        </aside>
      </section>

      <section id="ending-soon" className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Auction floor</p>
            <h2 className="mt-2 text-3xl font-semibold text-ink">Ending soon</h2>
          </div>
          <Link href="/marketplace?type=AUCTION" className="text-sm font-semibold text-ink underline underline-offset-4 hover:text-lagoon">View auctions</Link>
        </div>
        {endingSoon.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {endingSoon.map((listing) => (
              <Link key={listing.id} href={`/marketplace/${listing.id}`} className="rounded-lg border border-black/10 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-ember/40">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-ember/10 px-3 py-1 text-xs font-semibold text-ember">{typeLabels.AUCTION}</span>
                  <span className="flex items-center gap-1 text-xs text-black/50"><Timer className="h-3.5 w-3.5" aria-hidden /> {listing.auction?.endsAt ? formatDate(listing.auction.endsAt) : "Open"}</span>
                </div>
                <h3 className="mt-4 line-clamp-2 font-semibold text-ink">{listing.title}</h3>
                <p className="mt-3 text-xl font-semibold text-ink">{formatCurrency(listing.auction?.currentPrice?.toString() ?? listing.price.toString())}</p>
                <p className="mt-1 text-sm text-black/55">Current bid</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No active auctions yet" description="Create auction listings from the seller studio to populate this section." />
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-black/10 pt-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Browse</p>
            <h2 className="mt-2 text-3xl font-semibold text-ink">{query || category || type ? "Filtered results" : "Featured listings"}</h2>
          </div>
          <p className="text-sm text-black/55">{filteredListings.length} results</p>
        </div>
        {filteredListings.length ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                sellerName={listing.sellerProfile.shopName}
                category={listing.product.category.name}
                price={listing.price.toString()}
                currentPrice={listing.auction?.currentPrice?.toString()}
                endsAt={listing.auction?.endsAt}
                quantity={listing.quantity}
                listingType={listing.listingType}
                imageUrl={listing.product.images[0]?.url}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No matching listings" description="Try a broader search, clear filters, or seed the database for sample drops and auctions." />
        )}
      </section>
    </main>
  );
}
