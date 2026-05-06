import { ProductForm } from "@/components/ProductForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Catalog setup</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">New product</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
        Add product inventory with brand, condition, category, description, and one or more image URLs before creating marketplace listings.
      </p>
      <div className="mt-6">
        <ProductForm categories={categories} />
      </div>
    </section>
  );
}
