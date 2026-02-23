import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { TripTabs } from "@/components/TripTabs";
import { TripInfoForm } from "@/components/forms/TripInfoForm";

export default async function TripInfoPage({ params }: { params: { tripId: string } }) {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");

  const trip = await prisma.trip.findFirst({ where: { id: params.tripId, userId: session.user.id } });
  if (!trip) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Trip Info</h1>
      <TripTabs tripId={trip.id} active="info" />
      <TripInfoForm
        tripId={trip.id}
        initial={{
          destinationCity: trip.destinationCity,
          startDate: trip.startDate.toISOString(),
          endDate: trip.endDate.toISOString(),
          hotelDetails: trip.hotelDetails ?? "",
          flightDetails: trip.flightDetails ?? "",
          notes: trip.notes ?? ""
        }}
      />

      <div className="card p-5">
        <p className="text-sm text-slate-500">Summary</p>
        <p className="mt-1">Destination: {trip.destinationCity}</p>
        <p>Dates: {trip.startDate.toDateString()} - {trip.endDate.toDateString()}</p>
        <p>Hotel: {trip.hotelDetails || "-"}</p>
        <p>Flight: {trip.flightDetails || "-"}</p>
        <p>Notes: {trip.notes || "-"}</p>
      </div>
    </div>
  );
}