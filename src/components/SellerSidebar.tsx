import Link from "next/link";
import { Boxes, Gavel, LayoutDashboard, ListChecks, PackageCheck, PlusCircle, Radio } from "lucide-react";

const links = [
  { href: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/seller/products", label: "Products", icon: Boxes },
  { href: "/seller/products/new", label: "New product", icon: PlusCircle },
  { href: "/seller/listings", label: "Listings", icon: ListChecks },
  { href: "/seller/listings/new", label: "New listing", icon: Radio },
  { href: "/seller/auctions", label: "Auctions", icon: Gavel },
  { href: "/seller/orders", label: "Orders", icon: PackageCheck }
];

export function SellerSidebar() {
  return (
    <aside className="rounded-lg border border-black/10 bg-white p-3 shadow-soft lg:sticky lg:top-6">
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black/45">Seller studio</p>
      <nav className="mt-2 grid gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-black/65 transition hover:bg-mist hover:text-ink">
              <Icon className="h-4 w-4" aria-hidden />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
