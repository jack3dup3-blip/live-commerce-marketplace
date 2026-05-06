import Image from "next/image";
import Link from "next/link";
import { Gavel, Radio, ShoppingBag, Timer } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";

type ListingCardProps = {
  id: string;
  title: string;
  sellerName: string;
  category: string;
  price: number | string;
  quantity: number;
  listingType: "BUY_NOW" | "AUCTION" | "LIVE_ONLY";
  imageUrl?: string;
  currentPrice?: number | string;
  endsAt?: Date | string | null;
  sellerLabel?: string;
};

const labels = {
  BUY_NOW: "Buy now",
  AUCTION: "Auction",
  LIVE_ONLY: "Live only"
};

const actions = {
  BUY_NOW: "Buy now",
  AUCTION: "Bid now",
  LIVE_ONLY: "Watch live"
};

function priceLabel(listingType: ListingCardProps["listingType"], price: number | string, currentPrice?: number | string) {
  if (listingType === "LIVE_ONLY") {
    return "Live only";
  }

  if (listingType === "AUCTION") {
    return formatCurrency(currentPrice ?? price);
  }

  return formatCurrency(price);
}

export function ListingCard({ id, title, sellerName, category, price, quantity, listingType, imageUrl, currentPrice, endsAt, sellerLabel }: ListingCardProps) {
  const isAuction = listingType === "AUCTION";
  const isLive = listingType === "LIVE_ONLY";
  const Icon = isAuction ? Timer : isLive ? Radio : ShoppingBag;

  return (
    <Link href={`/marketplace/${id}`} className="group overflow-hidden rounded-lg border border-black/10 bg-white shadow-soft transition hover:-translate-y-1 hover:border-lagoon/40">
      <div className="relative aspect-[5/4] bg-mist">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 25vw, 100vw" />
        ) : null}
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-md bg-white/90 px-3 py-1 text-xs font-medium text-ink backdrop-blur">
          <Icon className={`h-3.5 w-3.5 ${isAuction ? "text-ember" : "text-lagoon"}`} aria-hidden />
          {labels[listingType]}
        </div>
        {isAuction ? (
          <div className="absolute bottom-3 left-3 rounded-md bg-ink/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {endsAt ? `Ends ${formatDate(endsAt)}` : "Timed auction"}
          </div>
        ) : null}
      </div>
      <div className="p-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-lagoon">{category}</p>
        <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-2 text-sm text-black/55">{sellerLabel ?? sellerName}</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-ink">{priceLabel(listingType, price, currentPrice)}</p>
            {isAuction ? <p className="text-xs text-black/50">Current bid</p> : null}
          </div>
          <p className="text-sm text-black/55">{quantity} available</p>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-md bg-mist px-3 py-2 text-sm font-semibold text-ink transition group-hover:bg-lagoon group-hover:text-white">
          <span>{actions[listingType]}</span>
          {isAuction ? <Gavel className="h-4 w-4" aria-hidden /> : <span aria-hidden>→</span>}
        </div>
      </div>
    </Link>
  );
}
