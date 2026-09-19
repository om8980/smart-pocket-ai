import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import WalletCard from "../components/WalletCard";
import AddMoneyModal from "../components/AddMoneyModal";
import ExpenseForm from "../components/ExpenseForm";
import TransactionHistory from "../components/TransactionHistory";
import SavingsGoal from "../components/SavingsGoal";
import {
  listenToWallet, listenToSplitSettings, listenToTransactions, listenToGoals,
  creditWallet, debitWallet, addSavingsGoal, contributeToGoal,
} from "../utils/firestoreHelpers";
import { runAllNudges } from "../utils/nudgeEngine";

export default function StudentDashboard() {
  const { currentUser, profile, logout } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [splitSettings, setSplitSettings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [showAddMoney, setShowAddMoney] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const unsub1 = listenToWallet(currentUser.uid, setWallet);
    const unsub2 = listenToSplitSettings(currentUser.uid, setSplitSettings);
    const unsub3 = listenToTransactions(currentUser.uid, setTransactions);
    const unsub4 = listenToGoals(currentUser.uid, setGoals);
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, [currentUser]);

  const nudges = wallet
    ? runAllNudges({
        enjoymentSpent: transactions.filter((t) => t.bucket === "enjoyment" && t.type === "debit")
          .reduce((s, t) => s + t.amount, 0),
        enjoymentBudget: wallet.enjoymentBalance || 100,
        monthsUntouched: 0,
      })
    : [];

  async function handleAddMoney(amount) {
    await creditWallet(currentUser.uid, amount, splitSettings);
    setShowAddMoney(false);
  }

  async function handleExpense({ bucket, amount, category, note }) {
    await debitWallet(currentUser.uid, bucket, amount, category, note);
  }

  async function handleAddGoal(title, targetAmount) {
    await addSavingsGoal(currentUser.uid, title, targetAmount);
  }

  async function handleContribute(goalId) {
    await contributeToGoal(goalId, 100);
    await debitWallet(currentUser.uid, "saving", 100, "savings-goal", "Contribution to goal");
  }

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-emerald">Hi, {profile?.name}</h1>
          <p className="text-sm text-ink/50">Student wallet</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddMoney(true)} className="rounded-card bg-emerald text-white px-4 py-2 text-sm font-medium">
            Add money
          </button>
          <button onClick={logout} className="rounded-card border border-mist px-4 py-2 text-sm font-medium">
            Log out
          </button>
        </div>
      </div>

      {nudges.map((n, i) => (
        <div key={i} className={`rounded-card p-3 text-sm ${
          n.level === "danger" ? "bg-clay/10 text-clay" : n.level === "success" ? "bg-emerald/10 text-emerald" : "bg-gold/10 text-gold"
        }`}>
          {n.message}
        </div>
      ))}

      {wallet && <WalletCard wallet={wallet} />}
      <ExpenseForm wallet={wallet} onSubmit={handleExpense} />
      <SavingsGoal goals={goals} onAddGoal={handleAddGoal} onContribute={handleContribute} />
      <TransactionHistory transactions={transactions} />

      {showAddMoney && splitSettings && (
        <AddMoneyModal
          splitSettings={splitSettings}
          studentName={profile?.name}
          onConfirm={handleAddMoney}
          onClose={() => setShowAddMoney(false)}
        />
      )}
    </div>
  );
}
