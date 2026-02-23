import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { TripTabs } from "@/components/TripTabs";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
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

      <div className="card overflow-x-auto p-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="pb-2">Title</th>
              <th className="pb-2">Category</th>
              <th className="pb-2">Original</th>
              <th className="pb-2">Base ({trip.baseCurrency})</th>
              <th className="pb-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {trip.expenses.map((expense) => (
              <tr key={expense.id} className="border-b border-slate-100">
                <td className="py-2">{expense.title}</td>
                <td className="py-2">{expense.category}</td>
                <td className="py-2">{expense.currencyOriginal} {expense.amountOriginal.toFixed(2)}</td>
                <td className="py-2">{expense.amountBase.toFixed(2)}</td>
                <td className="py-2">{new Date(expense.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}