import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { TripTabs } from "@/components/TripTabs";
import { PackingListClient } from "@/components/forms/PackingListClient";

export default async function TripPackingPage({ params }: { params: { tripId: string } }) {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");

  const trip = await prisma.trip.findFirst({
    where: { id: params.tripId, userId: session.user.id },
    include: { packingItems: { orderBy: { createdAt: "asc" } } }
  });

  if (!trip) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Packing List</h1>
      <TripTabs tripId={trip.id} active="packing" />
      <PackingListClient tripId={trip.id} initialItems={trip.packingItems} />
    </div>
  );
}