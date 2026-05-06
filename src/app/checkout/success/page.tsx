import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Payment received</p>
      <h1 className="mt-4 text-4xl font-semibold text-ink">Your order is being confirmed.</h1>
      <p className="mt-4 leading-7 text-black/60">
        Stripe will notify the marketplace webhook and your order will appear in your account once the payment is fulfilled.
      </p>
      <Link href="/account/orders" className="mt-6 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-lagoon">
        View orders
      </Link>
    </main>
  );
}
