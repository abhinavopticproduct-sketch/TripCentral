import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tripSchema } from "@/lib/validators";
import { requireUser } from "@/lib/require-user";

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

  const parsed = tripSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const trip = await prisma.trip.create({
    data: {
      ...parsed.data,
      baseCurrency: parsed.data.baseCurrency.toUpperCase(),
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      userId: auth.userId
    }
  });

  return NextResponse.json(trip, { status: 201 });
}