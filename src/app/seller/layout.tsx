import { SellerSidebar } from "@/components/SellerSidebar";
import { requireSellerTools } from "@/lib/auth";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  await requireSellerTools();

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
      <SellerSidebar />
      <div>{children}</div>
    </main>
  );
}
