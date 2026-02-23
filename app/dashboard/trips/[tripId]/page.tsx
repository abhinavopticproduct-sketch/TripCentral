import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { TripTabs } from "@/components/TripTabs";
import { BudgetSummary } from "@/components/BudgetSummary";
import { WeatherPanel } from "@/components/WeatherPanel";
import { DeleteTripButton } from "@/components/forms/DeleteTripButton";

export default async function TripOverviewPage({ params }: { params: { tripId: string } }) {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");

  const trip = await prisma.trip.findFirst({
    where: { id: params.tripId, userId: session.user.id },
    include: { expenses: true }
  });

  if (!trip) notFound();

  const totalExpenses = trip.expenses.reduce((sum, exp) => sum + exp.amountBase, 0);

  return (
    <div className="space-y-4">
      <div className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-brand">{trip.destinationCity}</p>
          <h1 className="text-2xl font-semibold">{trip.name}</h1>
          <p className="text-sm text-slate-600">{trip.startDate.toDateString()} - {trip.endDate.toDateString()}</p>
        </div>
        <div className="flex gap-2">
          <Link className="btn-secondary" href={`/dashboard/trips/${trip.id}/info`}>Edit Trip</Link>
          <DeleteTripButton tripId={trip.id} />
        </div>
      </div>

      <TripTabs tripId={trip.id} active="" />

      <BudgetSummary budget={trip.totalBudget} expenses={totalExpenses} currency={trip.baseCurrency} />
      <WeatherPanel city={trip.destinationCity} />
    </div>
  );
}