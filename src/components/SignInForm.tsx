"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, type SignInState } from "@/app/actions/auth";

const initialState: SignInState = {};

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="grid gap-5 rounded-lg border border-black/10 bg-white p-6 shadow-soft">
      {state.error ? <p className="rounded-md bg-ember/10 px-3 py-2 text-sm text-ember">{state.error}</p> : null}
      <div className="grid gap-2">
        <label className="text-sm font-medium text-ink" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-ink" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4" />
      </div>
      <button disabled={pending} className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-lagoon disabled:cursor-not-allowed disabled:opacity-60" type="submit">
        {pending ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-center text-sm text-black/60">
        New here? <Link href="/sign-up" className="font-semibold text-lagoon hover:text-ink">Create an account</Link>
      </p>
      <div className="rounded-lg bg-mist p-4 text-sm leading-6 text-black/65">
        <p className="font-semibold text-ink">Seed credentials</p>
        <p>Seller: theo@ateliergoods.test / seller123</p>
        <p>Buyer: maya@example.com / buyer123</p>
        <p>Admin: admin@market.test / admin123</p>
      </div>
    </form>
  );
}
