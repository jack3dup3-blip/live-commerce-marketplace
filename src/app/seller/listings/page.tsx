import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteListingAction } from "@/app/actions/seller";
import { EmptyState } from "@/components/EmptyState";
import { ListingCard } from "@/components/ListingCard";
import { requireSellerTools } from "@/lib/auth";
import { getSellerDashboardData } from "@/lib/marketplace";

export const dynamic = "force-dynamic";

export default async function SellerListingsPage() {
  const user = await requireSellerTools();
  const seller = await getSellerDashboardData(user.sellerProfileId ?? undefined);
  const listings = seller?.listings ?? [];

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Inventory</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Listings</h1>
        </div>
        <Link href="/seller/listings/new" className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-lagoon">
          <Plus className="h-4 w-4" aria-hidden />
          New listing
        </Link>
      </div>
      <div className="mt-6">
        {listings.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <div key={listing.id} className="grid gap-3">
                <ListingCard
                  id={listing.id}
                  title={listing.title}
                  sellerName={seller?.shopName ?? "Seller"}
                  category={listing.product.category.name}
                  price={listing.price.toString()}
                  quantity={listing.quantity}
                  listingType={listing.listingType}
                  imageUrl={listing.product.images[0]?.url}
                />
                <div className="flex gap-2">
                  <Link href={`/seller/listings/${listing.id}/edit`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-mist">
                    <Pencil className="h-4 w-4" aria-hidden />
                    Edit
                  </Link>
                  <form action={deleteListingAction} className="flex-1">
                    <input type="hidden" name="listingId" value={listing.id} />
                    <button className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-ember/30 bg-white px-3 py-2 text-sm font-semibold text-ember hover:bg-ember/10" type="submit">
                      <Trash2 className="h-4 w-4" aria-hidden />
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No listings yet" description="Create listings from approved products or seed the database for sample drops." />
        )}
      </div>
    </section>
  );
}
