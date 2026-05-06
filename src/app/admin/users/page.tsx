import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lagoon">Identity</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">Users</h1>
      <div className="mt-6 overflow-hidden rounded-lg border border-black/10 bg-white shadow-soft">
        {users.map((user) => (
          <div key={user.id} className="grid gap-2 border-b border-black/10 p-4 last:border-0 md:grid-cols-[1fr_1fr_120px]">
            <span className="font-medium text-ink">{user.name}</span>
            <span className="text-black/60">{user.email}</span>
            <span className="text-sm font-semibold text-lagoon">{user.role}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
