import Image from "next/image";
import Link from "next/link";
import { Radio, Timer } from "lucide-react";
import { formatCurrency } from "@/lib/format";

type ListingCardProps = {
  id: string;
  title: string;
  sellerName: string;
  category: string;
  price: number | string;
  quantity: number;
  listingType: "BUY_NOW" | "AUCTION" | "LIVE_ONLY";
  imageUrl?: string;
};

const labels = {
  BUY_NOW: "Buy now",
  AUCTION: "Auction",
  LIVE_ONLY: "Live only"
};

export function ListingCard({ id, title, sellerName, category, price, quantity, listingType, imageUrl }: ListingCardProps) {
  const isAuction = listingType === "AUCTION";

  return (
    <Link href={`/marketplace/${id}`} className="group overflow-hidden rounded-lg border border-black/10 bg-white shadow-soft transition hover:-translate-y-1 hover:border-lagoon/40">
      <div className="relative aspect-[5/4] bg-mist">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 25vw, 100vw" />
        ) : null}
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-md bg-white/90 px-3 py-1 text-xs font-medium text-ink backdrop-blur">
          {isAuction ? <Timer className="h-3.5 w-3.5 text-ember" aria-hidden /> : <Radio className="h-3.5 w-3.5 text-lagoon" aria-hidden />}
          {labels[listingType]}
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-lagoon">{category}</p>
        <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-2 text-sm text-black/55">{sellerName}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-lg font-semibold text-ink">{listingType === "LIVE_ONLY" ? "Live only" : formatCurrency(price)}</p>
          <p className="text-sm text-black/55">{quantity} available</p>
        </div>
      </div>
    </Link>
  );
}
