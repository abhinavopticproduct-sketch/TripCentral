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

  const ratesPayload = await getExchangeRates(trip.baseCurrency);
  const amountBase = convertToBase(parsed.data.amount, parsed.data.currency, trip.baseCurrency, ratesPayload.rates);

  const expense = await prisma.expense.create({
    data: {
      tripId: trip.id,
      title: parsed.data.title,
      category: parsed.data.category,
      amountOriginal: parsed.data.amount,
      currencyOriginal: parsed.data.currency.toUpperCase(),
      amountBase,
      date: new Date(parsed.data.date)
    }
  });

  return NextResponse.json({ expense, convertedTo: trip.baseCurrency }, { status: 201 });
}