import React, { useState } from "react";

export default function SavingsGoal({ goals, onAddGoal, onContribute }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");

  function handleAdd(e) {
    e.preventDefault();
    if (!title || !target) return;
    onAddGoal(title, Number(target));
    setTitle(""); setTarget(""); setShowForm(false);
  }

  return (
    <div className="rounded-card bg-white border border-mist p-5 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-lg font-semibold">Savings goals</h3>
        <button onClick={() => setShowForm((s) => !s)} className="text-sm text-emerald font-medium">
          {showForm ? "Cancel" : "+ New goal"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="flex gap-2">
          <input placeholder="e.g. Headphones" value={title} onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-card border border-mist px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald" />
          <input type="number" placeholder="₹ target" value={target} onChange={(e) => setTarget(e.target.value)}
            className="w-28 rounded-card border border-mist px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald" />
          <button type="submit" className="rounded-card bg-emerald text-white px-3 text-sm font-medium">Add</button>
        </form>
      )}

      <div className="space-y-3">
        {goals.map((g) => {
          const pct = g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100) : 0;
          return (
            <div key={g.id}>
              <div className="flex justify-between text-sm mb-1">
                <span>{g.title}</span>
                <span className="text-ink/60">₹{g.currentAmount} / ₹{g.targetAmount}</span>
              </div>
              <div className="bucket-bar">
                <span style={{ width: `${pct}%`, backgroundColor: "#C9A24B" }} />
              </div>
              <button onClick={() => onContribute(g.id)} className="text-xs text-emerald font-medium mt-1">
                + Add ₹100 from Savings
              </button>
            </div>
          );
        })}
        {goals.length === 0 && <p className="text-sm text-ink/50">No goals yet — set one above.</p>}
      </div>
    </div>
  );
}
