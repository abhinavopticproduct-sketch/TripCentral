"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#4F46E5", "#0EA5E9", "#22C55E", "#F59E0B", "#EF4444"];

export function ExpensePieChart({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <div className="card h-72 p-4">
      <p className="mb-2 text-sm font-medium">Expenses by Category</p>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90}>
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}