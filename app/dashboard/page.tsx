import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { TripCard } from "@/components/TripCard";

export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");

  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: "asc" }
  });

  return (
    <div className="space-y-4">
      <div className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Your Trips</h1>
          <p className="text-sm text-slate-600">Manage itineraries, budgets, weather, and planning notes.</p>
        </div>
        <Link href="/dashboard/trips/new" className="btn-primary">+ New Trip</Link>
      </div>

      {trips.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-600">No trips yet. Create your first trip to get started.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}