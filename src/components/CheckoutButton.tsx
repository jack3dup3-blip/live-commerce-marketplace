import { createBuyNowCheckoutAction } from "@/app/actions/checkout";

type CheckoutButtonProps = {
  listingId: string;
  availableQuantity: number;
};

export function CheckoutButton({ listingId, availableQuantity }: CheckoutButtonProps) {
  return (
    <form action={createBuyNowCheckoutAction} className="mt-6 grid gap-3">
      <input type="hidden" name="listingId" value={listingId} />
      <label className="text-sm font-medium text-ink" htmlFor="quantity">Quantity</label>
      <select id="quantity" name="quantity" defaultValue="1" className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4">
        {Array.from({ length: Math.min(availableQuantity, 10) }, (_, index) => index + 1).map((quantity) => (
          <option key={quantity} value={quantity}>{quantity}</option>
        ))}
      </select>
      <button className="w-full rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-lagoon" type="submit">
        Checkout with Stripe
      </button>
    </form>
  );
}
