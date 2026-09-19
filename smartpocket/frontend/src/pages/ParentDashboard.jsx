import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getLinkedChildren, listenToWallet, listenToTransactions, updateSplitSettings, listenToSplitSettings } from "../utils/firestoreHelpers";
import { SPLIT_LIMITS, validateSplit } from "../utils/splitEngine";
import WalletCard from "../components/WalletCard";
import TransactionHistory from "../components/TransactionHistory";

function ChildPanel({ child }) {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [split, setSplit] = useState(null);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const unsub1 = listenToWallet(child.id, setWallet);
    const unsub2 = listenToTransactions(child.id, setTransactions);
    const unsub3 = listenToSplitSettings(child.id, setSplit);
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [child.id]);

  async function handleSplitChange(field, value) {
    const next = { ...split, [field]: Number(value) };
    setSplit(next);
    const { valid, errors } = validateSplit(next);
    setErrors(errors);
    if (valid) await updateSplitSettings(child.id, next);
  }

  return (
    <div className="rounded-card bg-white border border-mist p-5 space-y-4">
      <h3 className="font-display text-lg font-semibold">{child.name}</h3>
      {wallet && <WalletCard wallet={wallet} />}

      {split && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Split percentages</p>
          {Object.entries(SPLIT_LIMITS).map(([key, { min, max }]) => (
            <div key={key}>
              <div className="flex justify-between text-sm">
                <span className="capitalize">{key.replace("Pct", "")}</span>
                <span>{split[key]}%</span>
              </div>
              <input type="range" min={min} max={max} value={split[key]}
                onChange={(e) => handleSplitChange(key, e.target.value)} className="w-full accent-emerald" />
            </div>
          ))}
          {errors.length > 0 && <p className="text-xs text-clay">{errors.join(" · ")}</p>}
        </div>
      )}

      <TransactionHistory transactions={transactions} />
    </div>
  );
}

export default function ParentDashboard() {
  const { currentUser, profile, logout } = useAuth();
  const [children, setChildren] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    getLinkedChildren(currentUser.uid).then(setChildren);
  }, [currentUser]);

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-emerald">Hi, {profile?.name}</h1>
          <p className="text-sm text-ink/50">Parent dashboard · Your UID: {currentUser?.uid}</p>
        </div>
        <button onClick={logout} className="rounded-card border border-mist px-4 py-2 text-sm font-medium">
          Log out
        </button>
      </div>

      <p className="text-xs text-ink/50 -mt-4">
        Share your UID above with your child so they can link their account to you during signup.
      </p>

      {children.length === 0 && (
        <p className="text-sm text-ink/60 rounded-card bg-white border border-mist p-5">
          No linked children yet. Once a student signs up with your UID as their Parent ID, they'll appear here.
        </p>
      )}

      {children.map((child) => <ChildPanel key={child.id} child={child} />)}
    </div>
  );
}
