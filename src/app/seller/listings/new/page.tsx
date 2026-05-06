import Link from "next/link";
import { ChevronRight, FileUp, ImageIcon, ImagePlus, Layers3, PackagePlus, Search, Trash2 } from "lucide-react";
import { ListingForm } from "@/components/ListingForm";
import { EmptyState } from "@/components/EmptyState";
import { requireSellerTools } from "@/lib/auth";
import { getSellerDashboardData, getSellerProductOptions } from "@/lib/marketplace";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

type NewListingPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function NewListingPage({ searchParams }: NewListingPageProps) {
  const user = await requireSellerTools();
  const [{ q }, products, seller] = await Promise.all([
    searchParams,
    getSellerProductOptions(user.sellerProfileId ?? undefined),
    getSellerDashboardData(user.sellerProfileId ?? undefined)
  ]);

  const query = q?.trim() ?? "";
  const normalizedQuery = query.toLowerCase();
  const filteredProducts = normalizedQuery
    ? products.filter((product) =>
        [
          product.name,
          product.brand,
          product.condition,
          product.category.name,
          product.description
        ].join(" ").toLowerCase().includes(normalizedQuery)
      )
    : products;

  const productOptions = filteredProducts.map((product) => ({
    id: product.id,
    name: product.name,
    inventory: product.inventory,
    brand: product.brand,
    condition: product.condition,
    category: { name: product.category.name }
  }));
  const draftListings = seller?.listings.filter((listing) => listing.status === "DRAFT").slice(0, 3) ?? [];
  const templateCandidates = products.slice(0, 2);

  return (
    <section className="grid gap-10">
      <div>
        <h1 className="text-4xl font-semibold tracking-[-0.01em] text-ink">Start listing with item info</h1>
        <p className="mt-3 max-w-3xl text-lg leading-7 text-black/60">
          Search your product catalog first, then create the listing from an existing inventory item.
        </p>

        <form className="mt-10 flex flex-col gap-3 sm:flex-row" action="/seller/listings/new">
          <label className="relative flex-1" htmlFor="q">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-black/45" aria-hidden />
            <input
              id="q"
              name="q"
              defaultValue={query}
              placeholder="Enter brand, model, description, etc."
              className="h-14 w-full rounded-full border border-black/20 bg-white px-14 text-base outline-none ring-lagoon/20 transition focus:border-lagoon focus:ring-4"
            />
          </label>
          <button className="h-14 rounded-full bg-blue-600 px-9 text-base font-semibold text-white transition hover:bg-ink" type="submit">
            Search
          </button>
        </form>
      </div>

      <div className="border-t border-black/10 pt-10">
        <h2 className="text-2xl font-semibold text-ink">More ways to start listing</h2>
        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          <Link href="/seller/products/new" className="group flex items-center gap-4 rounded-lg bg-white p-4 shadow-soft ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:ring-lagoon/25">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-sky-400 text-ink">
              <ImagePlus className="h-8 w-8" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-semibold text-ink">Photo upload</span>
              <span className="mt-1 block text-sm leading-5 text-black/60">Add a product with image URLs, then publish it.</span>
            </span>
            <ChevronRight className="h-6 w-6 text-ink transition group-hover:translate-x-1" aria-hidden />
          </Link>
          <button className="group flex items-center gap-4 rounded-lg bg-white p-4 text-left shadow-soft ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:ring-lagoon/25" type="button">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-amber-400 text-ink">
              <FileUp className="h-8 w-8" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-semibold text-ink">File upload</span>
              <span className="mt-1 block text-sm leading-5 text-black/60">Import inventory from CSV or XLSX.</span>
            </span>
            <ChevronRight className="h-6 w-6 text-ink transition group-hover:translate-x-1" aria-hidden />
          </button>
          <button className="group flex items-center gap-4 rounded-lg bg-white p-4 text-left shadow-soft ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:ring-lagoon/25" type="button">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-lime-500 text-ink">
              <Layers3 className="h-8 w-8" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-semibold text-ink">Bulk listing</span>
              <span className="mt-1 block text-sm leading-5 text-black/60">Create similar listings in batches.</span>
            </span>
            <ChevronRight className="h-6 w-6 text-ink transition group-hover:translate-x-1" aria-hidden />
          </button>
        </div>
      </div>

      <div className="grid gap-8 border-y border-black/10 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-ink">Drafts</h2>
              <p className="mt-1 text-black/60">Finish listings you already started.</p>
            </div>
            <Link href="/seller/listings" className="text-sm font-semibold text-ink underline underline-offset-4 hover:text-lagoon">View all drafts</Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {draftListings.length ? draftListings.map((listing) => (
              <Link key={listing.id} href={`/seller/listings/${listing.id}/edit`} className="group rounded-lg bg-white p-4 shadow-soft ring-1 ring-black/5 transition hover:ring-lagoon/25">
                <div className="flex items-center gap-3 text-black/55">
                  <PackagePlus className="h-5 w-5" aria-hidden />
                  <Trash2 className="h-5 w-5" aria-hidden />
                </div>
                <div className="mt-10 grid place-items-center text-black/25">
                  <ImageIcon className="h-12 w-12" aria-hidden />
                </div>
                <p className="mt-8 line-clamp-2 text-sm font-semibold text-ink group-hover:text-lagoon">{listing.title}</p>
              </Link>
            )) : [0, 1, 2].map((item) => (
              <div key={item} className="rounded-lg bg-white p-4 shadow-soft ring-1 ring-black/5">
                <div className="flex items-center gap-3 text-black/30">
                  <PackagePlus className="h-5 w-5" aria-hidden />
                  <Trash2 className="h-5 w-5" aria-hidden />
                </div>
                <div className="mt-14 grid place-items-center text-black/20">
                  <ImageIcon className="h-12 w-12" aria-hidden />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-black/10 lg:border-l lg:pl-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-ink">Templates</h2>
              <p className="mt-1 text-black/60">Use a product pattern to start faster.</p>
            </div>
            <Link href="/seller/products" className="text-sm font-semibold text-ink underline underline-offset-4 hover:text-lagoon">View products</Link>
          </div>
          <div className="mt-8 grid gap-3">
            {templateCandidates.length ? templateCandidates.map((product) => (
              <a key={product.id} href="#listing-form" className="flex items-center justify-between gap-4 rounded-lg bg-white p-4 shadow-soft ring-1 ring-black/5 transition hover:ring-lagoon/25">
                <span>
                  <span className="block font-semibold text-ink">{product.brand} {product.name}</span>
                  <span className="mt-1 block text-sm text-black/55">{product.category.name} - {formatCurrency(product.price.toString())}</span>
                </span>
                <ChevronRight className="h-5 w-5 text-black/45" aria-hidden />
              </a>
            )) : (
              <p className="max-w-md text-sm leading-6 text-black/60">
                You currently do not have listing templates. Add products to reuse catalog data when creating listings.
              </p>
            )}
          </div>
        </section>
      </div>

      <div id="listing-form" className="scroll-mt-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Create listing</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Use a product from your catalog</h2>
          </div>
          {query ? <Link href="/seller/listings/new" className="text-sm font-semibold text-ink underline underline-offset-4 hover:text-lagoon">Clear search</Link> : null}
        </div>
        {products.length ? (
          productOptions.length ? (
            <ListingForm products={productOptions} />
          ) : (
            <EmptyState title="No matching products" description="Try a different brand, model, category, or description from your product catalog." />
          )
        ) : (
          <EmptyState
            title="Add a product first"
            description="Listings are created from seller products so inventory, category, and pricing stay connected."
            action={<Link href="/seller/products/new" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-lagoon">Create product</Link>}
          />
        )}
      </div>
    </section>
  );
}
