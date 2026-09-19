// splitEngine.js
// Deterministic, rule-based split calculation. Zero external dependencies,
// zero API calls. This is the core money logic and must always work even
// if Firebase or Groq are unreachable.

export const DEFAULT_SPLIT = {
  emergencyPct: 30,
  savingPct: 40,
  enjoymentPct: 30,
};

export const SPLIT_LIMITS = {
  emergencyPct: { min: 20, max: 40 },
  savingPct: { min: 30, max: 50 },
  enjoymentPct: { min: 20, max: 40 },
};

export function validateSplit(split) {
  const errors = [];
  const total = split.emergencyPct + split.savingPct + split.enjoymentPct;

  Object.entries(SPLIT_LIMITS).forEach(([key, { min, max }]) => {
    const value = split[key];
    if (value === undefined || value < min || value > max) {
      errors.push(`${key} must be between ${min}% and ${max}% (got ${value}%)`);
    }
  });

  if (total !== 100) {
    errors.push(`Split percentages must sum to 100% (got ${total}%)`);
  }

  return { valid: errors.length === 0, errors };
}

export function calculateSplit(amount, split = DEFAULT_SPLIT) {
  const cfg = { ...DEFAULT_SPLIT, ...split };

  const rawEmergency = (amount * cfg.emergencyPct) / 100;
  const rawSaving = (amount * cfg.savingPct) / 100;

  const emergencyAmount = Math.round(rawEmergency);
  const savingAmount = Math.round(rawSaving);
  // Enjoyment absorbs the rounding remainder so the three parts always
  // sum exactly to `amount`.
  const enjoymentAmount = amount - emergencyAmount - savingAmount;

  return {
    emergencyAmount,
    savingAmount,
    enjoymentAmount,
    total: emergencyAmount + savingAmount + enjoymentAmount,
  };
}

export function fallbackExplanation(amount, splitResult, studentName = "there") {
  return `Hi ${studentName}! You received ₹${amount}. Here's the suggested split: ` +
    `₹${splitResult.emergencyAmount} to Emergency Fund, ₹${splitResult.savingAmount} to Savings, ` +
    `and ₹${splitResult.enjoymentAmount} for Enjoyment. You can adjust this before confirming.`;
}
