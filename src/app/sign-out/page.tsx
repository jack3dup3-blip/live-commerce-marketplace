import { signOutAction } from "@/app/actions/auth";

export default function SignOutPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Session</p>
      <h1 className="mt-4 text-4xl font-semibold text-ink">Sign out of LiveMarket?</h1>
      <form action={signOutAction} className="mt-6">
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-lagoon" type="submit">
          Sign out
        </button>
      </form>
    </main>
  );
}
