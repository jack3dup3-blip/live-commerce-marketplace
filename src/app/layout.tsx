import type { Metadata } from "next";
import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { currentUser } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Live Commerce Marketplace",
  description: "A production-grade live commerce marketplace foundation."
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await currentUser();

  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-black/10 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/marketplace" className="text-lg font-bold text-ink">LiveMarket</Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-black/60">
              <Link href="/marketplace" className="hover:text-ink">Marketplace</Link>
              {user ? <Link href="/account" className="hover:text-ink">Account</Link> : null}
              {user ? <Link href="/account/selling" className="hover:text-ink">Sell</Link> : null}
              {user?.sellerProfileId ? <Link href="/seller/dashboard" className="hover:text-ink">Seller</Link> : null}
              {user?.role === "ADMIN" ? <Link href="/admin" className="hover:text-ink">Admin</Link> : null}
              {user ? (
                <form action={signOutAction}>
                  <button className="font-medium hover:text-ink" type="submit">Sign out</button>
                </form>
              ) : (
                <Link href="/sign-in" className="rounded-md bg-ink px-3 py-2 font-semibold text-white hover:bg-lagoon">Sign in</Link>
              )}
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
