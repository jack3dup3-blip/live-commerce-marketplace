import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Access denied</p>
      <h1 className="mt-4 text-4xl font-semibold text-ink">This area requires a different role.</h1>
      <p className="mt-4 leading-7 text-black/60">Sign in with a seller, buyer, or admin account that has access to this workspace.</p>
      <Link href="/sign-in" className="mt-6 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-lagoon">
        Switch account
      </Link>
    </main>
  );
}
