import React from "react";

const BUCKETS = [
  { key: "emergencyBalance", label: "Emergency Fund", color: "#B5622A" },
  { key: "savingBalance", label: "Savings", color: "#1F5D50" },
  { key: "enjoymentBalance", label: "Enjoyment", color: "#C9A24B" },
];

export default function WalletCard({ wallet }) {
  const total = BUCKETS.reduce((sum, b) => sum + (wallet?.[b.key] || 0), 0);

  return (
    <div className="rounded-card bg-white border border-mist p-5">
      <p className="text-sm text-ink/60">Total balance</p>
      <p className="font-display text-3xl font-semibold text-ink">₹{total}</p>

      <div className="mt-5 space-y-4">
        {BUCKETS.map((b) => {
          const value = wallet?.[b.key] || 0;
          const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
          return (
            <div key={b.key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-ink/70">{b.label}</span>
                <span className="font-medium">₹{value}</span>
              </div>
              <div className="bucket-bar">
                <span style={{ width: `${pct}%`, backgroundColor: b.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
