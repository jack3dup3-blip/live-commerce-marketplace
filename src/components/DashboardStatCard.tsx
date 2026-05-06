import type { ReactNode } from "react";

type DashboardStatCardProps = {
  label: string;
  value: string | number;
  detail: string;
  icon?: ReactNode;
};

export function DashboardStatCard({ label, value, detail, icon }: DashboardStatCardProps) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-black/55">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
        </div>
        {icon ? <div className="rounded-md bg-mist p-2 text-lagoon">{icon}</div> : null}
      </div>
      <p className="mt-4 text-sm text-black/55">{detail}</p>
    </div>
  );
}
