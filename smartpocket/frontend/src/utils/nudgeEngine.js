// nudgeEngine.js
// Pure rule-based nudges/alerts. No API calls — must be instant and reliable.

/**
 * @param {number} enjoymentSpent - amount spent from enjoyment this month
 * @param {number} enjoymentBudget - monthly enjoyment budget (or balance)
 */
export function checkEnjoymentUsage(enjoymentSpent, enjoymentBudget) {
  if (!enjoymentBudget || enjoymentBudget <= 0) return null;
  const pctUsed = (enjoymentSpent / enjoymentBudget) * 100;
  if (pctUsed >= 100) {
    return { level: "danger", message: "You've used up this month's entire enjoyment budget." };
  }
  if (pctUsed >= 80) {
    return { level: "warning", message: `You've used ${Math.round(pctUsed)}% of this month's enjoyment budget.` };
  }
  return null;
}

/**
 * @param {number} monthsUntouched - months since last emergency fund transaction
 */
export function checkEmergencyDormant(monthsUntouched) {
  if (monthsUntouched >= 3) {
    return {
      level: "success",
      message: "Your Emergency Fund hasn't needed a withdrawal in 3+ months — nice work! Consider increasing your Saving percentage.",
    };
  }
  return null;
}

/**
 * @param {number} expenseAmount
 * @param {number} bucketBalance
 */
export function checkLargeExpense(expenseAmount, bucketBalance) {
  if (bucketBalance > 0 && expenseAmount > bucketBalance * 0.5) {
    return {
      level: "confirm",
      message: `This expense is more than half of this bucket's balance (₹${bucketBalance}). Are you sure?`,
    };
  }
  return null;
}

/**
 * Runs all relevant rule-based checks and returns an array of nudges.
 */
export function runAllNudges({ enjoymentSpent, enjoymentBudget, monthsUntouched, expenseAmount, bucketBalance }) {
  const nudges = [];
  const a = checkEnjoymentUsage(enjoymentSpent, enjoymentBudget);
  const b = checkEmergencyDormant(monthsUntouched);
  const c = expenseAmount !== undefined ? checkLargeExpense(expenseAmount, bucketBalance) : null;
  [a, b, c].forEach((n) => n && nudges.push(n));
  return nudges;
}
