import { ListingForm } from "@/components/ListingForm";
import { EmptyState } from "@/components/EmptyState";
import { requireSellerTools } from "@/lib/auth";
import { getSellerProductOptions } from "@/lib/marketplace";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const user = await requireSellerTools();
  const products = await getSellerProductOptions(user.sellerProfileId ?? undefined);

  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Marketplace supply</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">New listing</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
        Publish Buy Now, Auction, or Live Only listings from seller products with listing-specific validation.
      </p>
      <div className="mt-6">
        {products.length ? (
          <ListingForm
            products={products.map((product) => ({
              id: product.id,
              name: product.name,
              inventory: product.inventory,
              brand: product.brand,
              condition: product.condition,
              category: { name: product.category.name }
            }))}
          />
        ) : (
          <EmptyState title="Add a product first" description="Listings are created from seller products so inventory, category, and pricing stay connected." />
        )}
      </div>
    </section>
  );
}
