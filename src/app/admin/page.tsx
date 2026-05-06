import { Radio, Store, Users, WalletCards } from "lucide-react";
import { DashboardStatCard } from "@/components/DashboardStatCard";
import { getAdminMetrics } from "@/lib/marketplace";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const metrics = await getAdminMetrics();

  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Operations</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">Admin overview</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard label="Users" value={metrics.users} detail="Buyers, sellers, and admins." icon={<Users className="h-5 w-5" />} />
        <DashboardStatCard label="Listings" value={metrics.listings} detail="Marketplace supply." icon={<Store className="h-5 w-5" />} />
        <DashboardStatCard label="Orders" value={metrics.orders} detail="Transactions captured." icon={<WalletCards className="h-5 w-5" />} />
        <DashboardStatCard label="Streams" value={metrics.streams} detail="Live commerce events." icon={<Radio className="h-5 w-5" />} />
      </div>
    </section>
  );
}
