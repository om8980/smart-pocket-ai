// firestoreHelpers.js
// Small wrapper functions around Firestore reads/writes used across pages.
import {
  doc, getDoc, updateDoc, setDoc, addDoc, collection,
  query, where, orderBy, onSnapshot, serverTimestamp, increment,
} from "firebase/firestore";
import { db } from "../firebase";
import { calculateSplit } from "./splitEngine";

export function listenToWallet(uid, callback) {
  return onSnapshot(doc(db, "wallets", uid), (snap) => callback(snap.exists() ? snap.data() : null));
}

export function listenToSplitSettings(uid, callback) {
  return onSnapshot(doc(db, "splitSettings", uid), (snap) => callback(snap.exists() ? snap.data() : null));
}

export function listenToTransactions(uid, callback) {
  const q = query(collection(db, "transactions"), where("walletUid", "==", uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export function listenToGoals(uid, callback) {
  const q = query(collection(db, "savingsGoals"), where("uid", "==", uid));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

/**
 * Apply a credit (pocket money received) to a student's wallet using the
 * deterministic split engine, then log a transaction per bucket.
 */
export async function creditWallet(uid, amount, splitSettings) {
  const split = calculateSplit(amount, splitSettings);
  const walletRef = doc(db, "wallets", uid);

  await updateDoc(walletRef, {
    emergencyBalance: increment(split.emergencyAmount),
    savingBalance: increment(split.savingAmount),
    enjoymentBalance: increment(split.enjoymentAmount),
  });

  const buckets = [
    ["emergency", split.emergencyAmount],
    ["saving", split.savingAmount],
    ["enjoyment", split.enjoymentAmount],
  ];
  for (const [bucket, bucketAmount] of buckets) {
    await addDoc(collection(db, "transactions"), {
      walletUid: uid,
      type: "credit",
      bucket,
      amount: bucketAmount,
      category: "pocket-money",
      note: "Pocket money received",
      createdAt: serverTimestamp(),
    });
  }
  return split;
}

/**
 * Log an expense (debit) from a specific bucket.
 */
export async function debitWallet(uid, bucket, amount, category, note) {
  const walletRef = doc(db, "wallets", uid);
  const fieldMap = {
    emergency: "emergencyBalance",
    saving: "savingBalance",
    enjoyment: "enjoymentBalance",
  };
  await updateDoc(walletRef, {
    [fieldMap[bucket]]: increment(-Math.abs(amount)),
  });
  await addDoc(collection(db, "transactions"), {
    walletUid: uid,
    type: "debit",
    bucket,
    amount: Math.abs(amount),
    category: category || "general",
    note: note || "",
    createdAt: serverTimestamp(),
  });
}

export async function updateSplitSettings(uid, split) {
  await setDoc(doc(db, "splitSettings", uid), split, { merge: true });
}

export async function addSavingsGoal(uid, title, targetAmount, deadline) {
  await addDoc(collection(db, "savingsGoals"), {
    uid, title, targetAmount, currentAmount: 0, deadline: deadline || null,
    createdAt: serverTimestamp(),
  });
}

export async function contributeToGoal(goalId, amount) {
  await updateDoc(doc(db, "savingsGoals", goalId), { currentAmount: increment(amount) });
}

export async function getLinkedChildren(parentUid) {
  // Students store parentId; a real app would index this, this is a simple
  // client-side helper meant for small families (few children).
  const q = query(collection(db, "users"), where("parentId", "==", parentUid));
  const { getDocs } = await import("firebase/firestore");
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
