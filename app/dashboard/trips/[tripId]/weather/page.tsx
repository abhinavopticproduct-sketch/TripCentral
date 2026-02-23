import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { TripTabs } from "@/components/TripTabs";
import { WeatherPanel } from "@/components/WeatherPanel";

export default async function TripWeatherPage({ params }: { params: { tripId: string } }) {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");

  const trip = await prisma.trip.findFirst({ where: { id: params.tripId, userId: session.user.id } });
  if (!trip) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Weather</h1>
      <TripTabs tripId={trip.id} active="weather" />
      <WeatherPanel city={trip.destinationCity} />
    </div>
  );
}