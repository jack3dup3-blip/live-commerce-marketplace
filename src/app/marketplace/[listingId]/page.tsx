import Image from "next/image";
import { notFound } from "next/navigation";
import { Gavel, Radio, ShieldCheck, Store } from "lucide-react";
import { BidForm } from "@/components/BidForm";
import { CheckoutButton } from "@/components/CheckoutButton";
import { getListingById } from "@/lib/marketplace";
import { formatCurrency, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({ params }: { params: Promise<{ listingId: string }> }) {
  const { listingId } = await params;
  const listing = await getListingById(listingId);

  if (!listing) {
    notFound();
  }

  const primaryImage = listing.product.images[0]?.url;
  const liveStream = listing.liveProducts[0]?.liveStream;
  const listingTypeLabel = listing.listingType.replace("_", " ");
  const displayPrice = listing.listingType === "LIVE_ONLY" ? "Live only" : formatCurrency(listing.auction?.currentPrice?.toString() ?? listing.price.toString());
  const minimumBid = listing.auction ? Number(listing.auction.currentPrice) + Number(listing.auction.bidIncrement) : 0;

  return (
    <main className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
      <section>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-white shadow-soft">
          {primaryImage ? <Image src={primaryImage} alt={listing.title} fill className="object-cover" priority sizes="(min-width: 1024px) 60vw, 100vw" /> : null}
        </div>
        {listing.product.images.length > 1 ? (
          <div className="mt-4 grid grid-cols-4 gap-3">
            {listing.product.images.slice(1, 5).map((image) => (
              <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg bg-white shadow-sm">
                <Image src={image.url} alt={image.alt} fill className="object-cover" sizes="20vw" />
              </div>
            ))}
          </div>
        ) : null}
        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">{listing.product.category.name}</p>
          <h1 className="mt-3 text-4xl font-semibold text-ink">{listing.title}</h1>
          <p className="mt-4 max-w-3xl leading-7 text-black/65">{listing.description}</p>
          <div className="mt-8 grid gap-4 border-y border-black/10 py-5 sm:grid-cols-3">
            <div>
              <p className="text-sm text-black/55">Brand</p>
              <p className="mt-1 font-semibold text-ink">{listing.product.brand}</p>
            </div>
            <div>
              <p className="text-sm text-black/55">Condition</p>
              <p className="mt-1 font-semibold text-ink">{listing.product.condition.replace("_", " ").toLowerCase()}</p>
            </div>
            <div>
              <p className="text-sm text-black/55">Listing type</p>
              <p className="mt-1 font-semibold text-ink">{listingTypeLabel.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </section>

      <aside className="h-fit rounded-lg border border-black/10 bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-black/55">Current price</p>
            <p className="mt-2 text-4xl font-semibold text-ink">{displayPrice}</p>
          </div>
          <div className="rounded-md bg-mist p-2 text-lagoon">
            {listing.auction ? <Gavel className="h-5 w-5" aria-hidden /> : <Radio className="h-5 w-5" aria-hidden />}
          </div>
        </div>

        <div className="mt-6 grid gap-3 border-y border-black/10 py-5 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-black/55">Seller</span>
            <span className="font-medium text-ink">{listing.sellerProfile.shopName}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-black/55">Type</span>
            <span className="font-medium text-ink">{listingTypeLabel}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-black/55">Available</span>
            <span className="font-medium text-ink">{listing.quantity}</span>
          </div>
          {listing.auction ? (
            <div className="flex justify-between gap-4">
              <span className="text-black/55">Bid increment</span>
              <span className="font-medium text-ink">{formatCurrency(listing.auction.bidIncrement.toString())}</span>
            </div>
          ) : null}
          {listing.auction ? (
            <div className="flex justify-between gap-4">
              <span className="text-black/55">Minimum bid</span>
              <span className="font-medium text-ink">{formatCurrency(minimumBid)}</span>
            </div>
          ) : null}
          {listing.auction ? (
            <div className="flex justify-between gap-4">
              <span className="text-black/55">Anti-sniping</span>
              <span className="font-medium text-ink">{listing.auction.antiSnipingEnabled ? "Enabled" : "Off"}</span>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <span className="text-black/55">Ends</span>
            <span className="font-medium text-ink">{listing.endsAt ? formatDate(listing.endsAt) : "Open"}</span>
          </div>
        </div>

        {liveStream ? (
          <div className="mt-5 rounded-lg bg-mist p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Radio className="h-4 w-4 text-ember" aria-hidden />
              Featured in {liveStream.title}
            </p>
            <p className="mt-2 text-sm text-black/60">Status: {liveStream.status.toLowerCase()}</p>
          </div>
        ) : null}

        <div className="mt-5 rounded-lg bg-mist p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Store className="h-4 w-4 text-lagoon" aria-hidden />
            {listing.sellerProfile.shopName}
          </p>
          <p className="mt-2 text-sm leading-6 text-black/60">{listing.sellerProfile.bio ?? "Verified marketplace seller."}</p>
        </div>

        {listing.auction ? (
          <div className="mt-6 rounded-lg border border-black/10 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-lagoon">Auction detail</p>
            <div className="mt-3 grid gap-2 text-sm text-black/60">
              <p>Status: <span className="font-medium text-ink">{listing.auction.status.toLowerCase()}</span></p>
              <p>Starts: <span className="font-medium text-ink">{formatDate(listing.auction.startsAt)}</span></p>
              <p>Ends: <span className="font-medium text-ink">{formatDate(listing.auction.endsAt)}</span></p>
              <p>Anti-sniping: <span className="font-medium text-ink">{listing.auction.antiSnipingEnabled ? "extends final-window bids" : "off"}</span></p>
              <p>Highest bid: <span className="font-medium text-ink">{listing.auction.bids[0] ? `${formatCurrency(listing.auction.bids[0].amount.toString())} by ${listing.auction.bids[0].bidder.name}` : "No bids yet"}</span></p>
            </div>
            {listing.auction.status === "LIVE" ? <BidForm auctionId={listing.auction.id} minimumBid={minimumBid} /> : null}
          </div>
        ) : listing.listingType === "BUY_NOW" && listing.quantity > 0 ? (
          <CheckoutButton listingId={listing.id} availableQuantity={listing.quantity} />
        ) : (
          <button className="mt-6 w-full rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-lagoon">
            {listing.listingType === "AUCTION" ? "Place bid" : listing.listingType === "LIVE_ONLY" ? "Watch live" : "Sold out"}
          </button>
        )}
        <p className="mt-4 flex items-center gap-2 text-sm text-black/55">
          <ShieldCheck className="h-4 w-4 text-lagoon" aria-hidden />
          Protected checkout and bidding flows are ready for the next sprint.
        </p>
      </aside>
    </main>
  );
}
