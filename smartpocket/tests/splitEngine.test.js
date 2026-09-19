// Simple assertion-based tests for the deterministic split engine.
// Run with: node tests/splitEngine.test.js
import assert from "node:assert";
import { calculateSplit, validateSplit, DEFAULT_SPLIT } from "../frontend/src/utils/splitEngine.js";

// Test 1: default split sums exactly to the input amount, no rounding leakage.
let result = calculateSplit(1000, DEFAULT_SPLIT);
assert.strictEqual(result.total, 1000, "Split parts must sum exactly to input amount");
assert.strictEqual(result.emergencyAmount, 300);
assert.strictEqual(result.savingAmount, 400);
assert.strictEqual(result.enjoymentAmount, 300);

// Test 2: an amount that doesn't divide evenly still sums exactly.
result = calculateSplit(1001, DEFAULT_SPLIT);
assert.strictEqual(result.total, 1001, "Rounding remainder must be absorbed, not lost");

// Test 3: validateSplit rejects out-of-range percentages.
let check = validateSplit({ emergencyPct: 50, savingPct: 30, enjoymentPct: 20 });
assert.strictEqual(check.valid, false, "50% emergency exceeds the 40% max and should fail");

// Test 4: validateSplit accepts a valid custom split.
check = validateSplit({ emergencyPct: 25, savingPct: 45, enjoymentPct: 30 });
assert.strictEqual(check.valid, true, "This split is within limits and sums to 100");

console.log("All splitEngine tests passed.");
