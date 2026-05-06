"use client";

import { useActionState } from "react";
import { createSellerProfileAction, type SellerUpgradeState } from "@/app/actions/auth";

const initialState: SellerUpgradeState = {};

export function SellerUpgradeForm() {
  const [state, formAction, pending] = useActionState(createSellerProfileAction, initialState);
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="grid gap-5 rounded-lg border border-black/10 bg-white p-6 shadow-soft">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-ink" htmlFor="shopName">Shop name</label>
        <input id="shopName" name="shopName" className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4" />
        {errors.shopName ? <p className="text-sm text-ember">{errors.shopName}</p> : null}
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-ink" htmlFor="bio">Seller bio</label>
        <textarea id="bio" name="bio" rows={5} className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4" />
        {errors.bio ? <p className="text-sm text-ember">{errors.bio}</p> : null}
      </div>
      <button disabled={pending} className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-lagoon disabled:cursor-not-allowed disabled:opacity-60" type="submit">
        {pending ? "Opening seller tools..." : "Start selling"}
      </button>
    </form>
  );
}
