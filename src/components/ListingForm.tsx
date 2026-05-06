"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  startTime?: string;
  endTime?: string;
};

type ListingFormProps = {
  products: ProductOption[];
  listing?: ListingInitialValue;
};

const initialState: SellerActionState = {};

function datetimeLocal(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function ListingForm({ products, listing }: ListingFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(listing ? updateListingAction : createListingAction, initialState);
  const errors = state.errors ?? {};

  useEffect(() => {
    if (state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [router, state.redirectTo]);

  return (
    <form action={formAction} className="grid gap-5 rounded-lg border border-black/10 bg-white p-6 shadow-soft">
      {listing ? <input type="hidden" name="listingId" value={listing.id} /> : null}
      {state.message ? <p className="rounded-md bg-ember/10 px-3 py-2 text-sm text-ember">{state.message}</p> : null}
      <div className="grid gap-2">
        <label className="text-sm font-medium text-ink" htmlFor="productId">Product</label>
        <select id="productId" name="productId" defaultValue={listing?.productId ?? ""} className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4">
          <option value="">Select product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} | {product.brand} | {product.category.name} | {product.condition.replace("_", " ").toLowerCase()} | {product.inventory} available
            </option>
          ))}
        </select>
        {errors.productId ? <p className="text-sm text-ember">{errors.productId}</p> : null}
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-ink" htmlFor="title">Listing title</label>
        <input id="title" name="title" defaultValue={listing?.title} className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4" />
        {errors.title ? <p className="text-sm text-ember">{errors.title}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-ink" htmlFor="listingType">Listing type</label>
          <select id="listingType" name="listingType" defaultValue={listing?.listingType ?? "BUY_NOW"} className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4">
            <option value="BUY_NOW">Buy Now</option>
            <option value="AUCTION">Auction</option>
            <option value="LIVE_ONLY">Live only</option>
          </select>
          {errors.listingType ? <p className="text-sm text-ember">{errors.listingType}</p> : null}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-ink" htmlFor="price">Buy Now price</label>
          <input id="price" name="price" type="number" min="0" step="0.01" defaultValue={listing?.listingType === "BUY_NOW" ? listing.price : ""} className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4" />
          {errors.price ? <p className="text-sm text-ember">{errors.price}</p> : null}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-ink" htmlFor="quantity">Quantity</label>
          <input id="quantity" name="quantity" type="number" min="1" defaultValue={listing?.quantity} className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4" />
          {errors.quantity ? <p className="text-sm text-ember">{errors.quantity}</p> : null}
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-ink" htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={listing?.status ?? "ACTIVE"} className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4">
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="PAUSED">Paused</option>
        </select>
        {errors.status ? <p className="text-sm text-ember">{errors.status}</p> : null}
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-ink" htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={5} defaultValue={listing?.description} className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4" />
        {errors.description ? <p className="text-sm text-ember">{errors.description}</p> : null}
      </div>
      <div className="rounded-lg bg-mist p-4">
        <p className="text-sm font-semibold text-ink">Auction settings</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-ink" htmlFor="startingPrice">Starting price</label>
            <input id="startingPrice" name="startingPrice" type="number" min="0" step="0.01" defaultValue={listing?.startingPrice} className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4" />
            {errors.startingPrice ? <p className="text-sm text-ember">{errors.startingPrice}</p> : null}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-ink" htmlFor="bidIncrement">Bid increment</label>
            <input id="bidIncrement" name="bidIncrement" type="number" min="0" step="0.01" defaultValue={listing?.bidIncrement} className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4" />
            {errors.bidIncrement ? <p className="text-sm text-ember">{errors.bidIncrement}</p> : null}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-ink" htmlFor="startTime">Start time</label>
            <input id="startTime" name="startTime" type="datetime-local" defaultValue={datetimeLocal(listing?.startTime)} className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4" />
            {errors.startTime ? <p className="text-sm text-ember">{errors.startTime}</p> : null}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-ink" htmlFor="endTime">End time</label>
            <input id="endTime" name="endTime" type="datetime-local" defaultValue={datetimeLocal(listing?.endTime)} className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4" />
            {errors.endTime ? <p className="text-sm text-ember">{errors.endTime}</p> : null}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-black/55">Buy Now needs price and quantity. Auction needs price, increment, and timing. Live only appears in live commerce inventory.</p>
        <button disabled={pending} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-lagoon disabled:cursor-not-allowed disabled:opacity-60" type="submit">
          {pending ? "Saving..." : listing ? "Save changes" : "Publish listing"}
        </button>
      </div>
    </form>
  );
}
