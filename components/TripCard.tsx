import Link from "next/link";
import { format } from "date-fns";

type Props = {
  trip: {
    id: string;
    name: string;
    destinationCity: string;
    startDate: Date;
    endDate: Date;
    totalBudget: number;
    baseCurrency: string;
  };
};

export function TripCard({ trip }: Props) {
  return (
    <Link href={`/dashboard/trips/${trip.id}`} className="card block p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
      <p className="text-xs font-medium uppercase tracking-wide text-brand">{trip.destinationCity}</p>
      <h3 className="mt-1 text-lg font-semibold">{trip.name}</h3>
      <p className="mt-2 text-sm text-slate-600">
        {format(trip.startDate, "MMM d, yyyy")} - {format(trip.endDate, "MMM d, yyyy")}
      </p>
      <p className="mt-4 text-sm text-slate-700">
        Budget: <span className="font-semibold">{trip.baseCurrency} {trip.totalBudget.toFixed(2)}</span>
      </p>
    </Link>
  );
}