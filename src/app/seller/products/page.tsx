import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ProductCard } from "@/components/ProductCard";
import { requireSellerTools } from "@/lib/auth";
import { getSellerDashboardData } from "@/lib/marketplace";

export const dynamic = "force-dynamic";

export default async function SellerProductsPage() {
  const user = await requireSellerTools();
  const seller = await getSellerDashboardData(user.sellerProfileId ?? undefined);
  const products = seller?.products ?? [];

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Catalog</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Products</h1>
        </div>
        <Link href="/seller/products/new" className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-lagoon">
          <Plus className="h-4 w-4" aria-hidden />
          New product
        </Link>
      </div>

      <div className="mt-6">
        {products.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                category={product.category.name}
                brand={product.brand}
                condition={product.condition}
                inventory={product.inventory}
                imageUrl={product.images[0]?.url}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No products yet" description="Create a product draft or run the seed script to populate the seller catalog." />
        )}
      </div>
    </section>
  );
}
