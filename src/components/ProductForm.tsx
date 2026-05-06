"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProductAction, type SellerActionState } from "@/app/actions/seller";

type CategoryOption = {
  id: string;
  name: string;
};

type ProductFormProps = {
  categories: CategoryOption[];
};

const initialState: SellerActionState = {};

export function ProductForm({ categories }: ProductFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createProductAction, initialState);
  const errors = state.errors ?? {};

  useEffect(() => {
    if (state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [router, state.redirectTo]);

  return (
    <form action={formAction} className="grid gap-5 rounded-lg border border-black/10 bg-white p-6 shadow-soft">
      {state.message ? <p className="rounded-md bg-ember/10 px-3 py-2 text-sm text-ember">{state.message}</p> : null}
      <div className="grid gap-2">
        <label className="text-sm font-medium text-ink" htmlFor="title">Title</label>
        <input id="title" name="title" className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4" />
        {errors.title ? <p className="text-sm text-ember">{errors.title}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-ink" htmlFor="brand">Brand</label>
          <input id="brand" name="brand" className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4" />
          {errors.brand ? <p className="text-sm text-ember">{errors.brand}</p> : null}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-ink" htmlFor="condition">Condition</label>
          <select id="condition" name="condition" defaultValue="NEW" className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4">
            <option value="NEW">New</option>
            <option value="LIKE_NEW">Like new</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
          </select>
          {errors.condition ? <p className="text-sm text-ember">{errors.condition}</p> : null}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-ink" htmlFor="quantity">Quantity</label>
          <input id="quantity" name="quantity" type="number" min="0" className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4" />
          {errors.quantity ? <p className="text-sm text-ember">{errors.quantity}</p> : null}
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-ink" htmlFor="categoryId">Category</label>
        <select id="categoryId" name="categoryId" className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4">
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        {errors.categoryId ? <p className="text-sm text-ember">{errors.categoryId}</p> : null}
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-ink" htmlFor="imageUrls">Images</label>
        <textarea
          id="imageUrls"
          name="imageUrls"
          rows={4}
          placeholder="Add one image URL per line"
          className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4"
        />
        {errors.imageUrls ? <p className="text-sm text-ember">{errors.imageUrls}</p> : null}
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-ink" htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={5} className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4" />
        {errors.description ? <p className="text-sm text-ember">{errors.description}</p> : null}
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-black/55">Products hold inventory and images. Listings set how buyers can purchase or bid.</p>
        <button disabled={pending} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-lagoon disabled:cursor-not-allowed disabled:opacity-60" type="submit">
          {pending ? "Saving..." : "Save product"}
        </button>
      </div>
    </form>
  );
}
