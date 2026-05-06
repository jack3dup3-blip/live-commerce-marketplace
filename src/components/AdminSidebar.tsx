import Link from "next/link";
import { Gauge, ShieldCheck, Store } from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: Gauge },
  { href: "/admin/users", label: "Users", icon: ShieldCheck },
  { href: "/admin/listings", label: "Listings", icon: Store }
];

export function AdminSidebar() {
  return (
    <aside className="rounded-lg border border-black/10 bg-ink p-3 text-white shadow-soft lg:sticky lg:top-6">
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Admin</p>
      <nav className="mt-2 grid gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white">
              <Icon className="h-4 w-4" aria-hidden />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
