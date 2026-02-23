import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { packingItemSchema } from "@/lib/validators";

async function checkTrip(tripId: string, userId: string) {
  return prisma.trip.findFirst({ where: { id: tripId, userId } });
}

export async function GET(_: Request, { params }: { params: { tripId: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const trip = await checkTrip(params.tripId, auth.userId);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const items = await prisma.packingItem.findMany({
    where: { tripId: params.tripId },
    orderBy: { createdAt: "asc" }
  });

  return NextResponse.json(items);
}

export async function POST(req: Request, { params }: { params: { tripId: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const trip = await checkTrip(params.tripId, auth.userId);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = packingItemSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const item = await prisma.packingItem.create({
    data: {
      tripId: params.tripId,
      name: parsed.data.name
    }
  });

  return NextResponse.json(item, { status: 201 });
}

export async function PATCH(req: Request, { params }: { params: { tripId: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const trip = await checkTrip(params.tripId, auth.userId);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { itemId, packed } = await req.json();
  if (!itemId || typeof packed !== "boolean") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.packingItem.findFirst({ where: { id: itemId, tripId: params.tripId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.packingItem.update({ where: { id: itemId }, data: { packed } });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { tripId: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const trip = await checkTrip(params.tripId, auth.userId);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { itemId } = await req.json();
  if (!itemId) return NextResponse.json({ error: "Missing itemId" }, { status: 400 });

  await prisma.packingItem.deleteMany({ where: { id: itemId, tripId: params.tripId } });
  return NextResponse.json({ ok: true });
}