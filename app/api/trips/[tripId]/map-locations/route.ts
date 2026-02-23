import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { mapLocationSchema } from "@/lib/validators";

async function checkTrip(tripId: string, userId: string) {
  return prisma.trip.findFirst({ where: { id: tripId, userId } });
}

export async function GET(_: Request, { params }: { params: { tripId: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const trip = await checkTrip(params.tripId, auth.userId);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const locations = await prisma.mapLocation.findMany({
    where: { tripId: params.tripId },
    orderBy: { createdAt: "asc" }
  });

  return NextResponse.json(locations);
}

export async function POST(req: Request, { params }: { params: { tripId: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const trip = await checkTrip(params.tripId, auth.userId);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = mapLocationSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const location = await prisma.mapLocation.create({
    data: {
      tripId: params.tripId,
      ...parsed.data
    }
  });

  return NextResponse.json(location, { status: 201 });
}

export async function DELETE(req: Request, { params }: { params: { tripId: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const trip = await checkTrip(params.tripId, auth.userId);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { locationId } = await req.json();
  if (!locationId) return NextResponse.json({ error: "Missing locationId" }, { status: 400 });

  await prisma.mapLocation.deleteMany({ where: { id: locationId, tripId: params.tripId } });
  return NextResponse.json({ ok: true });
}