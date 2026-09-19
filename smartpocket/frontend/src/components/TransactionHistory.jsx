import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";

const COLORS = { emergency: "#B5622A", saving: "#1F5D50", enjoyment: "#C9A24B" };

export default function TransactionHistory({ transactions }) {
  const pieData = useMemo(() => {
    const totals = { emergency: 0, saving: 0, enjoyment: 0 };
    transactions.filter((t) => t.type === "debit").forEach((t) => { totals[t.bucket] = (totals[t.bucket] || 0) + t.amount; });
    return Object.entries(totals).map(([name, value]) => ({ name, value })).filter((d) => d.value > 0);
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const byMonth = {};
    transactions.forEach((t) => {
      const d = t.createdAt?.toDate ? t.createdAt.toDate() : new Date();
      const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
      byMonth[key] = byMonth[key] || { month: key, credit: 0, debit: 0 };
      byMonth[key][t.type] += t.amount;
    });
    return Object.values(byMonth).slice(-6);
  }, [transactions]);

  return (
    <div className="rounded-card bg-white border border-mist p-5 space-y-6">
      <h3 className="font-display text-lg font-semibold">Spending overview</h3>

      {pieData.length > 0 && (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                {pieData.map((entry) => <Cell key={entry.name} fill={COLORS[entry.name]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {monthlyData.length > 0 && (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="credit" fill="#1F5D50" />
              <Bar dataKey="debit" fill="#B5622A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="divide-y divide-mist max-h-60 overflow-y-auto">
        {transactions.slice(0, 20).map((t) => (
          <div key={t.id} className="py-2 flex justify-between text-sm">
            <div>
              <p className="font-medium capitalize">{t.category || t.bucket}</p>
              <p className="text-ink/50 text-xs capitalize">{t.bucket} · {t.note}</p>
            </div>
            <p className={t.type === "credit" ? "text-emerald font-medium" : "text-clay font-medium"}>
              {t.type === "credit" ? "+" : "-"}₹{t.amount}
            </p>
          </div>
        ))}
        {transactions.length === 0 && <p className="text-sm text-ink/50 py-2">No transactions yet.</p>}
      </div>
    </div>
  );
}
