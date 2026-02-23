type Props = {
  budget: number;
  expenses: number;
  currency: string;
};

export function BudgetSummary({ budget, expenses, currency }: Props) {
  const usage = budget > 0 ? (expenses / budget) * 100 : 0;
  const remaining = budget - expenses;

  return (
    <div className="card p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryItem label="Total Budget" value={`${currency} ${budget.toFixed(2)}`} />
        <SummaryItem label="Total Expenses" value={`${currency} ${expenses.toFixed(2)}`} />
        <SummaryItem label="Remaining" value={`${currency} ${remaining.toFixed(2)}`} />
        <SummaryItem label="Usage" value={`${usage.toFixed(1)}%`} />
      </div>

      {usage >= 80 && usage <= 100 ? (
        <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">Warning: you have used at least 80% of your budget.</div>
      ) : null}

      {usage > 100 ? (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">Budget exceeded: total spending is above plan.</div>
      ) : null}

      <div className="mt-4 h-3 rounded-full bg-slate-100">
        <div className="h-3 rounded-full bg-brand" style={{ width: `${Math.min(usage, 100)}%` }} />
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}