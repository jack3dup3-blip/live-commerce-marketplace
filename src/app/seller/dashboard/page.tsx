import { Boxes, Radio, ReceiptText } from "lucide-react";
import { DashboardStatCard } from "@/components/DashboardStatCard";
import { requireSellerTools } from "@/lib/auth";
import { getSellerDashboardData } from "@/lib/marketplace";

export const dynamic = "force-dynamic";

export default async function SellerDashboardPage() {
  const user = await requireSellerTools();
  const seller = await getSellerDashboardData(user.sellerProfileId ?? undefined);

  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Seller dashboard</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">{seller?.shopName ?? "Seller studio"}</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <DashboardStatCard label="Products" value={seller?.products.length ?? 0} detail="Catalog items ready for drops." icon={<Boxes className="h-5 w-5" />} />
        <DashboardStatCard label="Listings" value={seller?.listings.length ?? 0} detail="Active and draft marketplace inventory." icon={<ReceiptText className="h-5 w-5" />} />
        <DashboardStatCard label="Streams" value={seller?.liveStreams.length ?? 0} detail="Live shopping events planned." icon={<Radio className="h-5 w-5" />} />
      </div>
    </section>
  );
}
