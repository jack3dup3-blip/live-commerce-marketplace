import Image from "next/image";
import { Package } from "lucide-react";

type ProductCardProps = {
  name: string;
  category: string;
  brand: string;
  condition: string;
  inventory: number;
  imageUrl?: string;
};

export function ProductCard({ name, category, brand, condition, inventory, imageUrl }: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-soft">
      <div className="relative aspect-[4/3] bg-mist">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill className="object-cover" sizes="(min-width: 1024px) 25vw, 100vw" />
        ) : (
          <div className="flex h-full items-center justify-center text-black/35">
            <Package aria-hidden className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-lagoon">{category}</p>
            <h3 className="mt-2 text-base font-semibold text-ink">{name}</h3>
          </div>
          <p className="shrink-0 text-sm font-semibold text-ink">{brand}</p>
        </div>
        <p className="mt-4 text-sm text-black/55">{condition.replace("_", " ").toLowerCase()} · {inventory} units in inventory</p>
      </div>
    </article>
  );
}
