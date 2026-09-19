import React, { useState } from "react";
import { checkLargeExpense } from "../utils/nudgeEngine";

const BUCKETS = ["emergency", "saving", "enjoyment"];

export default function ExpenseForm({ wallet, onSubmit }) {
  const [bucket, setBucket] = useState("enjoyment");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [confirmNeeded, setConfirmNeeded] = useState(null);

  const fieldMap = { emergency: "emergencyBalance", saving: "savingBalance", enjoyment: "enjoymentBalance" };

  function handleSubmit(e) {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) return;

    const bucketBalance = wallet?.[fieldMap[bucket]] || 0;
    const warning = checkLargeExpense(numericAmount, bucketBalance);
    if (warning && !confirmNeeded) {
      setConfirmNeeded(warning);
      return;
    }

    onSubmit({ bucket, amount: numericAmount, category, note });
    setAmount(""); setCategory(""); setNote(""); setConfirmNeeded(null);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card bg-white border border-mist p-5 space-y-3">
      <h3 className="font-display text-lg font-semibold">Log an expense</h3>

      <div className="flex gap-2">
        {BUCKETS.map((b) => (
          <button type="button" key={b} onClick={() => { setBucket(b); setConfirmNeeded(null); }}
            className={`flex-1 rounded-card border py-1.5 text-sm capitalize ${
              bucket === b ? "bg-emerald text-white border-emerald" : "border-mist text-ink/70"
            }`}>
            {b}
          </button>
        ))}
      </div>

      <input type="number" min="1" placeholder="Amount (₹)" required value={amount}
        onChange={(e) => { setAmount(e.target.value); setConfirmNeeded(null); }}
        className="w-full rounded-card border border-mist px-3 py-2 outline-none focus:ring-2 focus:ring-emerald" />

      <input placeholder="Category (e.g. snacks, books)" value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full rounded-card border border-mist px-3 py-2 outline-none focus:ring-2 focus:ring-emerald" />

      <input placeholder="Note (optional)" value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full rounded-card border border-mist px-3 py-2 outline-none focus:ring-2 focus:ring-emerald" />

      {confirmNeeded && (
        <p className="text-sm text-clay">{confirmNeeded.message} Submit again to confirm.</p>
      )}

      <button type="submit" className="w-full rounded-card bg-emerald text-white py-2 text-sm font-medium">
        {confirmNeeded ? "Confirm expense" : "Log expense"}
      </button>
    </form>
  );
}
