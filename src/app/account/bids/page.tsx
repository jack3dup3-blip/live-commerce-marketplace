import { EmptyState } from "@/components/EmptyState";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountBidsPage() {
  const user = await requireUser();
  const bids = await prisma.bid.findMany({
    where: user.role === "ADMIN" ? undefined : { bidderId: user.id },
    include: { auction: { include: { listing: true } }, bidder: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <section>
      <h1 className="text-3xl font-semibold text-ink">Bids</h1>
      <div className="mt-6">
        {bids.length ? (
          <div className="grid gap-4">
            {bids.map((bid) => (
              <article key={bid.id} className="rounded-lg border border-black/10 bg-white p-5 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{bid.auction.listing.title}</p>
                    <p className="mt-1 text-sm text-black/55">{formatDate(bid.createdAt)} · {bid.auction.status.toLowerCase()}</p>
                  </div>
                  <p className="text-lg font-semibold text-ink">{formatCurrency(bid.amount.toString())}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No bids placed" description="Auction participation and current bid states will appear here." />
        )}
      </div>
    </section>
  );
}
