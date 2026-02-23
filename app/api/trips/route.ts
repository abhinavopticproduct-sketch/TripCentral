import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tripCreateSchema } from "@/lib/validators";
import { requireUser } from "@/lib/require-user";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const trips = await prisma.trip.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(trips);
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const parsed = tripCreateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const startDateRaw = parsed.data.startDate.slice(0, 10);
  const endDateRaw = parsed.data.endDate.slice(0, 10);
  const today = todayIsoDate();

  if (startDateRaw < today) {
    return NextResponse.json({ error: "Start date cannot be before today." }, { status: 400 });
  }

  if (endDateRaw < today) {
    return NextResponse.json({ error: "End date cannot be before today." }, { status: 400 });
  }

  if (endDateRaw < startDateRaw) {
    return NextResponse.json({ error: "End date cannot be before start date." }, { status: 400 });
  }

  const startDate = new Date(parsed.data.startDate);
  const endDate = new Date(parsed.data.endDate);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return NextResponse.json({ error: "Invalid date values." }, { status: 400 });
  }

  const trip = await prisma.trip.create({
    data: {
      ...parsed.data,
      baseCurrency: parsed.data.baseCurrency.toUpperCase(),
      startDate,
      endDate,
      userId: auth.userId
    }
  });

  return NextResponse.json(trip, { status: 201 });
}
