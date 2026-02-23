import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { expenseSchema } from "@/lib/validators";
import { convertToBase, getExchangeRates } from "@/lib/currency";

async function checkTrip(tripId: string, userId: string) {
  return prisma.trip.findFirst({ where: { id: tripId, userId } });
}

export async function GET(_: Request, { params }: { params: { tripId: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const trip = await checkTrip(params.tripId, auth.userId);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const expenses = await prisma.expense.findMany({
    where: { tripId: params.tripId },
    orderBy: { date: "desc" }
  });

  return NextResponse.json(expenses);
}

export async function POST(req: Request, { params }: { params: { tripId: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const trip = await checkTrip(params.tripId, auth.userId);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = expenseSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const sourceCurrency = parsed.data.currency.toUpperCase();
  const baseCurrency = trip.baseCurrency.toUpperCase();
  let amountBase = parsed.data.amount;
  let note: string | null = null;

  if (sourceCurrency !== baseCurrency) {
    try {
      const ratesPayload = await getExchangeRates(baseCurrency);
      amountBase = convertToBase(parsed.data.amount, sourceCurrency, baseCurrency, ratesPayload.rates);
    } catch {
      // Keep the app operational if external rate providers are slow/unavailable.
      amountBase = parsed.data.amount;
      note = "Live conversion unavailable. Stored with 1:1 fallback.";
    }
  }

  const expenseDate = new Date(parsed.data.date);
  if (Number.isNaN(expenseDate.getTime())) {
    return NextResponse.json({ error: "Invalid expense date." }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: {
      tripId: trip.id,
      title: parsed.data.title,
      category: parsed.data.category,
      amountOriginal: parsed.data.amount,
      currencyOriginal: sourceCurrency,
      amountBase,
      date: expenseDate
    }
  });

  return NextResponse.json({ expense, convertedTo: trip.baseCurrency, note }, { status: 201 });
}
