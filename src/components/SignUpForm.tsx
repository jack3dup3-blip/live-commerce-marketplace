"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, type SignUpState } from "@/app/actions/auth";

const initialState: SignUpState = {};

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="grid gap-5 rounded-lg border border-black/10 bg-white p-6 shadow-soft">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-ink" htmlFor="name">Name</label>
        <input id="name" name="name" autoComplete="name" className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4" />
        {errors.name ? <p className="text-sm text-ember">{errors.name}</p> : null}
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-ink" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4" />
        {errors.email ? <p className="text-sm text-ember">{errors.email}</p> : null}
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-ink" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4" />
        {errors.password ? <p className="text-sm text-ember">{errors.password}</p> : null}
      </div>
      <button disabled={pending} className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-lagoon disabled:cursor-not-allowed disabled:opacity-60" type="submit">
        {pending ? "Creating account..." : "Create account"}
      </button>
      <p className="text-center text-sm text-black/60">
        Already have an account? <Link href="/sign-in" className="font-semibold text-lagoon hover:text-ink">Sign in</Link>
      </p>
    </form>
  );
}
