import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tripUpdateSchema } from "@/lib/validators";
import { requireUser } from "@/lib/require-user";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

async function getOwnedTrip(tripId: string, userId: string) {
  return prisma.trip.findFirst({ where: { id: tripId, userId } });
}

export async function GET(_: Request, { params }: { params: { tripId: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const trip = await getOwnedTrip(params.tripId, auth.userId);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(trip);
}

export async function PATCH(req: Request, { params }: { params: { tripId: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const existing = await getOwnedTrip(params.tripId, auth.userId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = tripUpdateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const startDate = parsed.data.startDate ? new Date(parsed.data.startDate) : undefined;
  const endDate = parsed.data.endDate ? new Date(parsed.data.endDate) : undefined;

  if (startDate && Number.isNaN(startDate.getTime())) {
    return NextResponse.json({ error: "Invalid start date." }, { status: 400 });
  }

  if (endDate && Number.isNaN(endDate.getTime())) {
    return NextResponse.json({ error: "Invalid end date." }, { status: 400 });
  }

  const nextStartRaw = (parsed.data.startDate ?? existing.startDate.toISOString()).slice(0, 10);
  const nextEndRaw = (parsed.data.endDate ?? existing.endDate.toISOString()).slice(0, 10);
  const today = todayIsoDate();

  if (nextStartRaw < today) {
    return NextResponse.json({ error: "Start date cannot be before today." }, { status: 400 });
  }

  if (nextEndRaw < today) {
    return NextResponse.json({ error: "End date cannot be before today." }, { status: 400 });
  }

  if (nextEndRaw < nextStartRaw) {
    return NextResponse.json({ error: "End date cannot be before start date." }, { status: 400 });
  }

  const updated = await prisma.trip.update({
    where: { id: params.tripId },
    data: {
      ...parsed.data,
      baseCurrency: parsed.data.baseCurrency?.toUpperCase(),
      startDate,
      endDate
    }
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { tripId: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const existing = await getOwnedTrip(params.tripId, auth.userId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.trip.delete({ where: { id: params.tripId } });
  return NextResponse.json({ ok: true });
}
