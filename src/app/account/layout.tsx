import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/account" className="rounded-md bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm">Overview</Link>
        <Link href="/account/orders" className="rounded-md bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm">Orders</Link>
        <Link href="/account/bids" className="rounded-md bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm">Bids</Link>
        <Link href="/account/selling" className="rounded-md bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm">Selling</Link>
      </div>
      {children}
    </main>
  );
}
