import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { expenseUpdateSchema } from "@/lib/validators";
import { convertToBase, getExchangeRates } from "@/lib/currency";

async function getOwnedTrip(tripId: string, userId: string) {
  return prisma.trip.findFirst({ where: { id: tripId, userId } });
}

async function getOwnedExpense(expenseId: string, tripId: string) {
  return prisma.expense.findFirst({ where: { id: expenseId, tripId } });
}

export async function PATCH(req: Request, { params }: { params: { tripId: string; expenseId: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const trip = await getOwnedTrip(params.tripId, auth.userId);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await getOwnedExpense(params.expenseId, params.tripId);
  if (!existing) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

  const body = await req.json();
  const parsed = expenseUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const nextTitle = parsed.data.title ?? existing.title;
  const nextCategory = parsed.data.category ?? existing.category;
  const nextAmountOriginal = parsed.data.amount ?? existing.amountOriginal;
  const nextCurrencyOriginal = (parsed.data.currency ?? existing.currencyOriginal).toUpperCase();
  const nextDateRaw = parsed.data.date ?? existing.date.toISOString();
  const nextDate = new Date(nextDateRaw);

  if (Number.isNaN(nextDate.getTime())) {
    return NextResponse.json({ error: "Invalid expense date." }, { status: 400 });
  }

  const baseCurrency = trip.baseCurrency.toUpperCase();
  let nextAmountBase = nextAmountOriginal;
  let note: string | null = null;

  if (nextCurrencyOriginal !== baseCurrency) {
    try {
      const ratesPayload = await getExchangeRates(baseCurrency);
      nextAmountBase = convertToBase(nextAmountOriginal, nextCurrencyOriginal, baseCurrency, ratesPayload.rates);
    } catch {
      nextAmountBase = nextAmountOriginal;
      note = "Live conversion unavailable. Stored with 1:1 fallback.";
    }
  }

  const updated = await prisma.expense.update({
    where: { id: existing.id },
    data: {
      title: nextTitle,
      category: nextCategory,
      amountOriginal: nextAmountOriginal,
      currencyOriginal: nextCurrencyOriginal,
      amountBase: nextAmountBase,
      date: nextDate
    }
  });

  return NextResponse.json({ expense: updated, note });
}

export async function DELETE(_: Request, { params }: { params: { tripId: string; expenseId: string } }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const trip = await getOwnedTrip(params.tripId, auth.userId);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await getOwnedExpense(params.expenseId, params.tripId);
  if (!existing) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

  await prisma.expense.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}
