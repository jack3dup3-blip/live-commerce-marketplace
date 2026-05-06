import { requireUser } from "@/lib/auth";

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <section className="rounded-lg border border-black/10 bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Buyer account</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">{user.name}</h1>
      <p className="mt-3 text-black/60">{user.email}</p>
      <p className="mt-6 max-w-2xl text-sm leading-6 text-black/60">
        Your customer account can buy, bid, and unlock seller tools from one login.
      </p>
    </section>
  );
}
