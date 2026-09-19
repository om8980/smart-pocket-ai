import React, { useState } from "react";
import { calculateSplit, fallbackExplanation } from "../utils/splitEngine";

/**
 * Add-money flow: parent (or student, for demo) enters an amount, sees the
 * deterministic split, an AI-generated friendly explanation (with a
 * pre-written fallback), then confirms.
 */
export default function AddMoneyModal({ splitSettings, studentName, onConfirm, onClose }) {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState("input"); // input | preview
  const [explanation, setExplanation] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [split, setSplit] = useState(null);

  async function handlePreview(e) {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) return;

    const result = calculateSplit(numericAmount, splitSettings);
    setSplit(result);
    setStep("preview");
    setLoadingAI(true);

    try {
      const res = await fetch("/api/ai-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numericAmount, splitPercentages: splitSettings, studentName }),
      });
      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      setExplanation(data.explanation || fallbackExplanation(numericAmount, result, studentName));
    } catch {
      setExplanation(fallbackExplanation(numericAmount, result, studentName));
    } finally {
      setLoadingAI(false);
    }
  }

  function handleConfirm() {
    onConfirm(Number(amount), split);
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-card max-w-md w-full p-6">
        <h2 className="font-display text-xl font-semibold mb-4">Add pocket money</h2>

        {step === "input" && (
          <form onSubmit={handlePreview} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Amount (₹)</label>
              <input
                type="number" min="1" required autoFocus value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-card border border-mist px-3 py-2 outline-none focus:ring-2 focus:ring-emerald"
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 rounded-card border border-mist py-2 text-sm font-medium">
                Cancel
              </button>
              <button type="submit" className="flex-1 rounded-card bg-emerald text-white py-2 text-sm font-medium">
                See suggested split
              </button>
            </div>
          </form>
        )}

        {step === "preview" && split && (
          <div className="space-y-4">
            <div className="rounded-card bg-mist/40 p-4 text-sm space-y-1">
              <p>Emergency Fund: <strong>₹{split.emergencyAmount}</strong></p>
              <p>Savings: <strong>₹{split.savingAmount}</strong></p>
              <p>Enjoyment: <strong>₹{split.enjoymentAmount}</strong></p>
            </div>
            <p className="text-sm text-ink/70 italic min-h-[3rem]">
              {loadingAI ? "Thinking of a friendly note…" : explanation}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setStep("input")} className="flex-1 rounded-card border border-mist py-2 text-sm font-medium">
                Back
              </button>
              <button onClick={handleConfirm} className="flex-1 rounded-card bg-emerald text-white py-2 text-sm font-medium">
                Confirm & add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
