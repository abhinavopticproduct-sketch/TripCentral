import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { TripTabs } from "@/components/TripTabs";
import { MapPlanner } from "@/components/forms/MapPlanner";

async function geocodeCity(city: string): Promise<{ lat: number; lng: number }> {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`, {
    headers: { "User-Agent": "TripCentral/1.0" },
    next: { revalidate: 86400 }
  });

  if (!res.ok) return { lat: 40.7128, lng: -74.006 };
  const data = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!data[0]) return { lat: 40.7128, lng: -74.006 };

  return {
    lat: Number(data[0].lat),
    lng: Number(data[0].lon)
  };
}

export default async function TripMapPage({ params }: { params: { tripId: string } }) {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");

  const trip = await prisma.trip.findFirst({
    where: { id: params.tripId, userId: session.user.id },
    include: { mapLocations: true }
  });

  if (!trip) notFound();

  const destination = await geocodeCity(trip.destinationCity);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Map</h1>
      <TripTabs tripId={trip.id} active="map" />
      <MapPlanner tripId={trip.id} destination={destination} initialLocations={trip.mapLocations} />
    </div>
  );
}