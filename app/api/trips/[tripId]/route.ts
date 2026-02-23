import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tripSchema } from "@/lib/validators";
import { requireUser } from "@/lib/require-user";

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

  const parsed = tripSchema.partial().safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.trip.update({
    where: { id: params.tripId },
    data: {
      ...parsed.data,
      baseCurrency: parsed.data.baseCurrency?.toUpperCase(),
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined
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