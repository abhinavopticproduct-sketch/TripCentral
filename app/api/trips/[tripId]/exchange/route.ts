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
  const from = trip.baseCurrency.toUpperCase();

  if (to === from) {
    return NextResponse.json({
      from,
      to,
      rate: 1,
      timestamp: new Date().toISOString()
    });
  }

  try {
    const rates = await getExchangeRates(from);
    if (!rates.rates[to]) {
      return NextResponse.json({ error: "Unsupported target currency" }, { status: 400 });
    }

    return NextResponse.json({
      from,
      to,
      rate: rates.rates[to],
      timestamp: rates.timestamp
    });
  } catch {
    return NextResponse.json(
      {
        from,
        to,
        rate: 1,
        timestamp: new Date().toISOString(),
        note: "Live rates unavailable, showing 1:1 fallback."
      },
      { status: 200 }
    );
  }
}
