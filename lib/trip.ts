export function getBudgetStatus(totalBudget: number, totalExpenses: number) {
  const usage = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
  const remaining = totalBudget - totalExpenses;

  return {
    usage,
    remaining,
    warning: usage >= 80 && usage <= 100,
    exceeded: usage > 100
  };
}