"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ImagePlus, Info, PackageCheck, SlidersHorizontal, Upload } from "lucide-react";
import { createListingAction, updateListingAction, type SellerActionState } from "@/app/actions/seller";

type ProductOption = {
  id: string;
  name: string;
  inventory: number;
  brand: string;
  condition: string;
  category: { name: string };
};

type ListingInitialValue = {
  id: string;
  productId: string;
  title: string;
  description: string;
  listingType: "BUY_NOW" | "AUCTION" | "LIVE_ONLY";
  price: string;
  quantity: number;
  status: "DRAFT" | "ACTIVE" | "PAUSED";
  startingPrice?: string;
  bidIncrement?: string;
  antiSnipingEnabled?: boolean;
  startTime?: string;
  endTime?: string;
};

type ListingFormProps = {
  products: ProductOption[];
  listing?: ListingInitialValue;
};

const initialState: SellerActionState = {};

const inputClass = "h-11 rounded-md border border-black/20 bg-white px-3 text-sm outline-none ring-lagoon/20 transition focus:border-lagoon focus:ring-4";
const selectClass = `${inputClass} pr-8`;
const labelClass = "text-sm font-semibold text-ink";

function datetimeLocal(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-ember">{message}</p> : null;
}

function Section({
  title,
  eyebrow,
  children
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-black/10 py-7 first:border-t-0 first:pt-0">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">{eyebrow}</p> : null}
          <h3 className="mt-1 text-lg font-semibold text-ink">{title}</h3>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-ink" type="button">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
          See options
        </button>
      </div>
      {children}
    </section>
  );
}

export function ListingForm({ products, listing }: ListingFormProps) {
  const router = useRouter();
  const [selectedProductId, setSelectedProductId] = useState(listing?.productId ?? products[0]?.id ?? "");
  const [state, formAction, pending] = useActionState(listing ? updateListingAction : createListingAction, initialState);
  const errors = state.errors ?? {};
  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId),
    [products, selectedProductId]
  );

  useEffect(() => {
    if (state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [router, state.redirectTo]);

  return (
    <form action={formAction} className="mx-auto max-w-4xl rounded-lg border border-black/10 bg-white px-5 py-6 shadow-soft sm:px-8">
      {listing ? <input type="hidden" name="listingId" value={listing.id} /> : null}
      {state.message ? <p className="mb-5 rounded-md bg-ember/10 px-3 py-2 text-sm text-ember">{state.message}</p> : null}

      <div className="mb-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Complete your listing</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Listing details</h2>
      </div>

      <Section title="Photos + video" eyebrow="Media">
        <p className="mb-5 text-sm leading-6 text-black/60">Add product media here soon. For now, listings inherit product photos from your catalog item.</p>
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <div className="grid min-h-48 place-items-center rounded-lg border border-dashed border-black/30 bg-white p-5 text-center">
            <div>
              <Upload className="mx-auto h-7 w-7 text-black/45" aria-hidden />
              <p className="mt-3 text-sm font-semibold text-ink">Drag and drop files</p>
              <button className="mt-4 rounded-full border border-black/20 px-4 py-2 text-xs font-semibold text-ink" type="button">Upload from computer</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {Array.from({ length: 15 }).map((_, index) => (
              <div key={index} className="aspect-square rounded-lg bg-mist">
                {index === 0 ? (
                  <div className="grid h-full place-items-center rounded-lg bg-lagoon/10 text-lagoon">
                    <ImagePlus className="h-7 w-7" aria-hidden />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Title">
        <div className="grid gap-2">
          <label className={labelClass} htmlFor="title">Item title</label>
          <input id="title" name="title" maxLength={80} defaultValue={listing?.title ?? selectedProduct?.name ?? ""} className={inputClass} />
          <div className="flex justify-between gap-4 text-xs text-black/50">
            <FieldError message={errors.title} />
            <span>80 characters max</span>
          </div>
        </div>
      </Section>

      <Section title="Item category">
        <div className="grid gap-4 rounded-lg bg-mist p-4 sm:grid-cols-[1fr_auto]">
          <div>
            <label className={labelClass} htmlFor="productId">Catalog product</label>
            <select
              id="productId"
              name="productId"
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
              className={`mt-2 w-full ${selectClass}`}
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} | {product.brand} | {product.category.name} | {product.condition.replace("_", " ").toLowerCase()} | {product.inventory} available
                </option>
              ))}
            </select>
            <FieldError message={errors.productId} />
            {selectedProduct ? (
              <p className="mt-3 text-sm text-black/60">
                {selectedProduct.category.name} - {selectedProduct.brand} - {selectedProduct.condition.replace("_", " ").toLowerCase()} - {selectedProduct.inventory} available
              </p>
            ) : null}
          </div>
          <div className="self-end rounded-md border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-ink">
            Category locked
          </div>
        </div>
      </Section>

      <Section title="Variations">
        <div className="flex items-start gap-3 rounded-md bg-lagoon/10 p-3 text-sm text-black/65">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-lagoon" aria-hidden />
          <p>Variations are for selling an item in multiple sizes, colors, or styles. We will add variant support after core listing flows are stable.</p>
        </div>
      </Section>

      <Section title="Item specifics" eyebrow="Required details">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className={labelClass} htmlFor="brandDisplay">Brand</label>
            <input id="brandDisplay" value={selectedProduct?.brand ?? ""} readOnly className={`${inputClass} bg-mist`} />
          </div>
          <div className="grid gap-2">
            <label className={labelClass} htmlFor="conditionDisplay">Condition</label>
            <input id="conditionDisplay" value={selectedProduct?.condition.replace("_", " ").toLowerCase() ?? ""} readOnly className={`${inputClass} bg-mist`} />
          </div>
          <div className="grid gap-2">
            <label className={labelClass} htmlFor="status">Listing status</label>
            <select id="status" name="status" defaultValue={listing?.status ?? "ACTIVE"} className={selectClass}>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="PAUSED">Paused</option>
            </select>
            <FieldError message={errors.status} />
          </div>
          <div className="grid gap-2">
            <label className={labelClass} htmlFor="quantity">Quantity</label>
            <input id="quantity" name="quantity" type="number" min="1" defaultValue={listing?.quantity ?? 1} className={inputClass} />
            <FieldError message={errors.quantity} />
          </div>
        </div>
      </Section>

      <Section title="Description">
        <div className="grid gap-2">
          <label className={labelClass} htmlFor="description">Describe the item</label>
          <textarea id="description" name="description" rows={6} defaultValue={listing?.description ?? ""} className="rounded-md border border-black/20 px-3 py-2 text-sm outline-none ring-lagoon/20 transition focus:border-lagoon focus:ring-4" />
          <FieldError message={errors.description} />
        </div>
      </Section>

      <Section title="Selling format + price">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <label className={labelClass} htmlFor="listingType">Listing type</label>
            <select id="listingType" name="listingType" defaultValue={listing?.listingType ?? "BUY_NOW"} className={selectClass}>
              <option value="BUY_NOW">Buy Now</option>
              <option value="AUCTION">Auction</option>
              <option value="LIVE_ONLY">Live only</option>
            </select>
            <FieldError message={errors.listingType} />
          </div>
          <div className="grid gap-2">
            <label className={labelClass} htmlFor="price">Buy Now price</label>
            <input id="price" name="price" type="number" min="0" step="0.01" defaultValue={listing?.listingType === "BUY_NOW" ? listing.price : ""} className={inputClass} />
            <FieldError message={errors.price} />
          </div>
          <div className="grid gap-2">
            <label className={labelClass} htmlFor="reservePreview">Inventory source</label>
            <div id="reservePreview" className="flex h-11 items-center gap-2 rounded-md bg-mist px-3 text-sm text-black/60">
              <PackageCheck className="h-4 w-4 text-lagoon" aria-hidden />
              Product catalog
            </div>
          </div>
        </div>
      </Section>

      <Section title="Auction settings">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className={labelClass} htmlFor="startingPrice">Starting price</label>
            <input id="startingPrice" name="startingPrice" type="number" min="0" step="0.01" defaultValue={listing?.startingPrice} className={inputClass} />
            <FieldError message={errors.startingPrice} />
          </div>
          <div className="grid gap-2">
            <label className={labelClass} htmlFor="bidIncrement">Bid increment</label>
            <input id="bidIncrement" name="bidIncrement" type="number" min="0" step="0.01" defaultValue={listing?.bidIncrement} className={inputClass} />
            <FieldError message={errors.bidIncrement} />
          </div>
          <div className="grid gap-2">
            <label className={labelClass} htmlFor="startTime">Start time</label>
            <input id="startTime" name="startTime" type="datetime-local" defaultValue={datetimeLocal(listing?.startTime)} className={inputClass} />
            <FieldError message={errors.startTime} />
          </div>
          <div className="grid gap-2">
            <label className={labelClass} htmlFor="endTime">End time</label>
            <input id="endTime" name="endTime" type="datetime-local" defaultValue={datetimeLocal(listing?.endTime)} className={inputClass} />
            <FieldError message={errors.endTime} />
          </div>
        </div>
        <label className="mt-4 flex items-start gap-3 rounded-md border border-black/10 bg-mist p-3 text-sm text-black/65">
          <input name="antiSnipingEnabled" type="checkbox" defaultChecked={listing?.antiSnipingEnabled ?? false} className="mt-1 h-4 w-4 rounded border-black/20 text-lagoon focus:ring-lagoon/30" />
          <span>
            <span className="block font-semibold text-ink">Enable anti-sniping</span>
            Extend the auction by 30 seconds when a bid lands in the final 30 seconds.
          </span>
        </label>
      </Section>

      <div className="sticky bottom-0 -mx-5 flex flex-col gap-3 border-t border-black/10 bg-white/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="flex items-center gap-2 text-sm text-black/55">
          <CheckCircle2 className="h-4 w-4 text-lagoon" aria-hidden />
          Buy Now needs price and quantity. Auction needs price, increment, and timing.
        </p>
        <button disabled={pending} className="rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-lagoon disabled:cursor-not-allowed disabled:opacity-60" type="submit">
          {pending ? "Saving..." : listing ? "Save changes" : "Publish listing"}
        </button>
      </div>
    </form>
  );
}
