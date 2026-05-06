import { EmptyState } from "@/components/EmptyState";
import { DashboardStatCard } from "@/components/DashboardStatCard";
import { requireSellerTools } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SellerOrdersPage() {
  const user = await requireSellerTools();

  const orderItems = await prisma.orderItem.findMany({
    where: {
      listing: {
        sellerProfileId: user.sellerProfileId ?? undefined
      }
    },
    include: {
      product: true,
      listing: true,
      order: { include: { buyer: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const grossSales = orderItems.reduce((sum, item) => sum + Number(item.total), 0);
  const platformFees = orderItems.reduce((sum, item) => sum + Number(item.order.platformFee), 0);

  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Fulfillment</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">Orders</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <DashboardStatCard label="Order items" value={orderItems.length} detail="Paid checkout line items." />
        <DashboardStatCard label="Gross sales" value={formatCurrency(grossSales)} detail="Before marketplace fees." />
        <DashboardStatCard label="Platform fees" value={formatCurrency(platformFees)} detail="Recorded for settlement." />
      </div>

      <div className="mt-6">
        {orderItems.length ? (
          <div className="grid gap-4">
            {orderItems.map((item) => (
              <article key={item.id} className="rounded-lg border border-black/10 bg-white p-5 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{item.product.name}</p>
                    <p className="mt-1 text-sm text-black/55">
                      {item.order.buyer.name} · {formatDate(item.createdAt)} · Qty {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-ink">{formatCurrency(item.total.toString())}</p>
                    <p className="text-sm text-black/55">{item.order.status.toLowerCase()}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No seller orders yet" description="Paid Buy Now checkout items for your listings will appear here." />
        )}
      </div>
    </section>
  );
}
