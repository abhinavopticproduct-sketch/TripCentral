import Link from "next/link";

const tabs = [
  { slug: "", label: "Overview" },
  { slug: "expenses", label: "Expenses" },
  { slug: "weather", label: "Weather" },
  { slug: "packing", label: "Packing List" },
  { slug: "map", label: "Map" },
  { slug: "info", label: "Trip Info" }
];

export function TripTabs({ tripId, active }: { tripId: string; active: string }) {
  return (
    <div className="card overflow-x-auto p-2">
      <div className="flex min-w-max gap-2">
        {tabs.map((tab) => {
          const href = `/dashboard/trips/${tripId}${tab.slug ? `/${tab.slug}` : ""}`;
          const isActive = active === tab.slug;
          return (
            <Link
              key={tab.slug || "overview"}
              href={href}
              className={`rounded-xl px-3 py-2 text-sm ${isActive ? "bg-brand text-white" : "text-slate-700 hover:bg-slate-100"}`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}