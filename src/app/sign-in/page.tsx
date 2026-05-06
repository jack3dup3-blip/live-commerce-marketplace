import { SignInForm } from "@/components/SignInForm";

export default function SignInPage() {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Secure access</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-ink md:text-6xl">Sign in to manage drops, bids, and operations.</h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-black/60">
          Sprint 2 uses database-backed users and signed HTTP-only session cookies, with role-aware routing for buyers, sellers, and admins.
        </p>
      </section>
      <SignInForm />
    </main>
  );
}
