import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { getCityWeather } from "@/lib/weather";

export async function GET(_: Request, { params }: { params: { tripId: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const trip = await prisma.trip.findFirst({ where: { id: params.tripId, userId: auth.userId } });
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const weather = await getCityWeather(trip.destinationCity);
  if (!weather) {
    return NextResponse.json({ error: "Weather unavailable. Configure OPENWEATHER_API_KEY." }, { status: 503 });
  }

  return NextResponse.json(weather);
}