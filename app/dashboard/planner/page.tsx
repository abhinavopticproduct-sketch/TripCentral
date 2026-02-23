import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PlannerPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");

  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: "asc" },
    select: {
      id: true,
      name: true,
      destinationCity: true,
      startDate: true,
      endDate: true
    }
  });

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h1 className="text-xl font-semibold">Planner</h1>
        <p className="mt-1 text-sm text-slate-600">
          Open the map planner for any trip and manage saved locations.
        </p>
      </div>

      {trips.length === 0 ? (
        <div className="card p-6 text-sm text-slate-600">
          No trips found. Create a trip first, then open its planner map.
          <div className="mt-3">
            <Link href="/dashboard/trips/new" className="btn-primary">
              Create Trip
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {trips.map((trip) => (
            <div key={trip.id} className="card p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-brand">{trip.destinationCity}</p>
              <h2 className="mt-1 text-lg font-semibold">{trip.name}</h2>
              <p className="mt-2 text-sm text-slate-600">
                {trip.startDate.toDateString()} - {trip.endDate.toDateString()}
              </p>
              <div className="mt-4 flex gap-2">
                <Link className="btn-primary" href={`/dashboard/trips/${trip.id}/map`}>
                  Open Map Planner
                </Link>
                <Link className="btn-secondary" href={`/dashboard/trips/${trip.id}`}>
                  Open Trip
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
