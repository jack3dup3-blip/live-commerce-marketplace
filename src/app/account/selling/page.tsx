import Link from "next/link";
import { SellerUpgradeForm } from "@/components/SellerUpgradeForm";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountSellingPage() {
  const user = await requireUser();

  if (user.sellerProfileId) {
    return (
      <section className="rounded-lg border border-black/10 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Seller profile</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">You are ready to sell.</h1>
        <p className="mt-3 text-black/60">Manage your products, listings, and livestream inventory from the seller studio.</p>
        <Link href="/seller/dashboard" className="mt-6 inline-flex rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-lagoon">
          Open seller studio
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Start selling</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Upgrade your customer account with seller tools.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
          Buyers and sellers share the same login. Creating a seller profile unlocks products, listings, auctions, and live commerce tools.
        </p>
      </div>
      <SellerUpgradeForm />
    </section>
  );
}
