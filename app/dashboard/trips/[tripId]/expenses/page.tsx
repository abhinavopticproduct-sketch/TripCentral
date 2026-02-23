import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { TripTabs } from "@/components/TripTabs";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { ExpensesTableClient } from "@/components/forms/ExpensesTableClient";
import { CurrencyConverter } from "@/components/CurrencyConverter";
import { ExpensePieChart } from "@/components/ExpensePieChart";
import { BudgetSummary } from "@/components/BudgetSummary";

export default async function TripExpensesPage({ params }: { params: { tripId: string } }) {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");

  const trip = await prisma.trip.findFirst({
    where: { id: params.tripId, userId: session.user.id },
    include: { expenses: { orderBy: { date: "desc" } } }
  });

  if (!trip) notFound();

  const totalExpenses = trip.expenses.reduce((sum, exp) => sum + exp.amountBase, 0);
  const grouped = trip.expenses.reduce<Record<string, number>>((acc, exp) => {
    acc[exp.category] = (acc[exp.category] ?? 0) + exp.amountBase;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Expenses</h1>
      <TripTabs tripId={trip.id} active="expenses" />

      <BudgetSummary budget={trip.totalBudget} expenses={totalExpenses} currency={trip.baseCurrency} />
      <ExpenseForm tripId={trip.id} baseCurrency={trip.baseCurrency} />
      <CurrencyConverter tripId={trip.id} baseCurrency={trip.baseCurrency} />

      <ExpensePieChart data={Object.entries(grouped).map(([name, value]) => ({ name, value }))} />

      <ExpensesTableClient
        tripId={trip.id}
        baseCurrency={trip.baseCurrency}
        expenses={trip.expenses.map((expense) => ({
          id: expense.id,
          title: expense.title,
          category: expense.category,
          amountOriginal: expense.amountOriginal,
          currencyOriginal: expense.currencyOriginal,
          amountBase: expense.amountBase,
          date: expense.date.toISOString()
        }))}
      />
    </div>
  );
}
