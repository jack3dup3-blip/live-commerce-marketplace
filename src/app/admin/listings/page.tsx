import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage() {
  const listings = await prisma.listing.findMany({
    include: { sellerProfile: true, product: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Supply controls</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">Listings</h1>
      <div className="mt-6 overflow-hidden rounded-lg border border-black/10 bg-white shadow-soft">
        {listings.map((listing) => (
          <div key={listing.id} className="grid gap-2 border-b border-black/10 p-4 last:border-0 md:grid-cols-[1fr_180px_120px_120px]">
            <span className="font-medium text-ink">{listing.title}</span>
            <span className="text-black/60">{listing.sellerProfile.shopName}</span>
            <span className="text-sm font-semibold text-ink">{formatCurrency(listing.price.toString())}</span>
            <span className="text-sm font-semibold text-lagoon">{listing.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
