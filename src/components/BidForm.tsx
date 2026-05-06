"use client";

import { useState, useTransition } from "react";
import { formatCurrency } from "@/lib/format";

type BidFormProps = {
  auctionId: string;
  minimumBid: number;
};

export function BidForm({ auctionId, minimumBid }: BidFormProps) {
  const [amount, setAmount] = useState(String(minimumBid));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submitBid() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const response = await fetch(`/api/auctions/${auctionId}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) })
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Unable to place bid.");
        return;
      }

      setMessage(payload.extended ? "Bid placed. Auction extended by 30 seconds." : "Bid placed.");
      setAmount(String(Number(payload.auction.currentPrice) + Number(payload.auction.bidIncrement)));
      setTimeout(() => window.location.reload(), 600);
    });
  }

  return (
    <div className="mt-6 grid gap-3">
      <label className="text-sm font-medium text-ink" htmlFor="bidAmount">Your bid</label>
      <input
        id="bidAmount"
        type="number"
        min={minimumBid}
        step="0.01"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        className="rounded-md border border-black/10 px-3 py-2 outline-none ring-lagoon/20 focus:ring-4"
      />
      <button disabled={pending} onClick={submitBid} className="w-full rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-lagoon disabled:cursor-not-allowed disabled:opacity-60" type="button">
        {pending ? "Placing bid..." : `Bid ${formatCurrency(amount || minimumBid)}`}
      </button>
      {error ? <p className="rounded-md bg-ember/10 px-3 py-2 text-sm text-ember">{error}</p> : null}
      {message ? <p className="rounded-md bg-lagoon/10 px-3 py-2 text-sm text-lagoon">{message}</p> : null}
    </div>
  );
}
