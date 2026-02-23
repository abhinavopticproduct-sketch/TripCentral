import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { getExchangeRates } from "@/lib/currency";

export async function GET(req: Request, { params }: { params: { tripId: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const trip = await prisma.trip.findFirst({ where: { id: params.tripId, userId: auth.userId } });
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(req.url);
  const to = (url.searchParams.get("to") || "USD").toUpperCase();

  const rates = await getExchangeRates(trip.baseCurrency);
  if (!rates.rates[to]) {
    return NextResponse.json({ error: "Unsupported target currency" }, { status: 400 });
  }

  return NextResponse.json({
    from: trip.baseCurrency,
    to,
    rate: rates.rates[to],
    timestamp: rates.timestamp
  });
}