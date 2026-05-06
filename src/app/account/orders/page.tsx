import { EmptyState } from "@/components/EmptyState";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: user.role === "ADMIN" ? undefined : { buyerId: user.id },
    include: {
      buyer: true,
      items: {
        include: {
          product: true,
          listing: { include: { sellerProfile: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <section>
      <h1 className="text-3xl font-semibold text-ink">Orders</h1>
      <div className="mt-6">
        {orders.length ? (
          <div className="grid gap-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-lg border border-black/10 bg-white p-5 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">Order {order.id.slice(-6).toUpperCase()}</p>
                    <p className="mt-1 text-sm text-black/55">{formatDate(order.createdAt)} · {order.items.length} item · {order.status.toLowerCase()}</p>
                  </div>
                  <p className="text-lg font-semibold text-ink">{formatCurrency(order.total.toString())}</p>
                </div>
                <div className="mt-4 grid gap-3 border-t border-black/10 pt-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 text-sm">
                      <div>
                        <p className="font-medium text-ink">{item.product.name}</p>
                        <p className="text-black/55">{item.listing.sellerProfile.shopName} · Qty {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-ink">{formatCurrency(item.total.toString())}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No orders yet" description="Completed purchases and live drop checkouts will appear here." />
        )}
      </div>
    </section>
  );
}
