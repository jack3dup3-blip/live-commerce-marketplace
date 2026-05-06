import { Gavel } from "lucide-react";
import { closeAuctionAction } from "@/app/actions/auction";
import { DashboardStatCard } from "@/components/DashboardStatCard";
import { EmptyState } from "@/components/EmptyState";
import { requireSellerTools } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SellerAuctionsPage() {
  const user = await requireSellerTools();
  const auctions = await prisma.auction.findMany({
    where: {
      listing: {
        sellerProfileId: user.sellerProfileId ?? undefined
      }
    },
    include: {
      listing: { include: { product: true } },
      bids: {
        include: { bidder: true },
        orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
        take: 1
      }
    },
    orderBy: { endsAt: "asc" }
  });

  const liveAuctions = auctions.filter((auction) => auction.status === "LIVE").length;
  const endedAuctions = auctions.filter((auction) => auction.status === "ENDED").length;
  const totalBids = auctions.reduce((sum, auction) => sum + auction.bids.length, 0);

  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Auction desk</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">Auction management</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <DashboardStatCard label="Live auctions" value={liveAuctions} detail="Accepting bids now." icon={<Gavel className="h-5 w-5" />} />
        <DashboardStatCard label="Ended auctions" value={endedAuctions} detail="Locked or awaiting settlement." />
        <DashboardStatCard label="Tracked leaders" value={totalBids} detail="Highest bid snapshots." />
      </div>

      <div className="mt-6">
        {auctions.length ? (
          <div className="grid gap-4">
            {auctions.map((auction) => {
              const highestBid = auction.bids[0];
              const canClose = auction.status === "LIVE" && auction.endsAt <= new Date();

              return (
                <article key={auction.id} className="rounded-lg border border-black/10 bg-white p-5 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-ink">{auction.listing.title}</p>
                      <p className="mt-1 text-sm text-black/55">{auction.listing.product.name} - {auction.status.toLowerCase()} - ends {formatDate(auction.endsAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-ink">{formatCurrency(auction.currentPrice.toString())}</p>
                      <p className="text-sm text-black/55">{highestBid ? `Leader: ${highestBid.bidder.name}` : "No bids yet"}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4">
                    <p className="text-sm text-black/60">
                      Increment {formatCurrency(auction.bidIncrement.toString())}
                      {auction.antiSnipingEnabled ? " - anti-sniping on" : " - anti-sniping off"}
                      {auction.settlementOrderId ? ` - order ${auction.settlementOrderId.slice(-6).toUpperCase()}` : ""}
                    </p>
                    <form action={closeAuctionAction}>
                      <input type="hidden" name="auctionId" value={auction.id} />
                      <button disabled={!canClose} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-lagoon disabled:cursor-not-allowed disabled:opacity-50" type="submit">
                        Close auction
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No auctions yet" description="Auction listings you create will appear here for monitoring and closeout." />
        )}
      </div>
    </section>
  );
}
