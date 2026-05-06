import { EmptyState } from "@/components/EmptyState";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountBidsPage() {
  const user = await requireUser();
  const bids = await prisma.bid.findMany({
    where: user.role === "ADMIN" ? undefined : { bidderId: user.id },
    include: {
      auction: {
        include: {
          listing: { include: { product: true, sellerProfile: true } },
          bids: { orderBy: [{ amount: "desc" }, { createdAt: "asc" }], take: 1 }
        }
      },
      bidder: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <section>
      <h1 className="text-3xl font-semibold text-ink">Active bids</h1>
      <div className="mt-6">
        {bids.length ? (
          <div className="grid gap-4">
            {bids.map((bid) => {
              const highestBid = bid.auction.bids[0];
              const isWinning = highestBid?.id === bid.id;

              return (
                <article key={bid.id} className="rounded-lg border border-black/10 bg-white p-5 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-ink">{bid.auction.listing.title}</p>
                      <p className="mt-1 text-sm text-black/55">
                        {bid.auction.listing.sellerProfile.shopName} · {formatDate(bid.createdAt)} · {bid.auction.status.toLowerCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-ink">{formatCurrency(bid.amount.toString())}</p>
                      <p className={isWinning ? "text-sm font-semibold text-lagoon" : "text-sm font-semibold text-ember"}>
                        {isWinning ? "Highest bid" : "Outbid"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 border-t border-black/10 pt-4 text-sm text-black/60 sm:grid-cols-3">
                    <p>Current: <span className="font-medium text-ink">{formatCurrency(bid.auction.currentPrice.toString())}</span></p>
                    <p>Ends: <span className="font-medium text-ink">{formatDate(bid.auction.endsAt)}</span></p>
                    <p>Item: <span className="font-medium text-ink">{bid.auction.listing.product.name}</span></p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No active bids" description="Auction bids and current winning status will appear here." />
        )}
      </div>
    </section>
  );
}
