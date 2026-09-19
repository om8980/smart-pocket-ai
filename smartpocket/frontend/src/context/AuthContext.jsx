import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null); // users/{uid} doc: { name, email, role, parentId }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        setProfile(snap.exists() ? snap.data() : null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signup({ name, email, password, role, parentId }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userDoc = {
      name,
      email,
      role, // "parent" | "student"
      parentId: role === "student" ? (parentId || null) : null,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", cred.user.uid), userDoc);

    if (role === "student") {
      // Seed an empty wallet and default split settings for new students.
      await setDoc(doc(db, "wallets", cred.user.uid), {
        emergencyBalance: 0,
        savingBalance: 0,
        enjoymentBalance: 0,
      });
      await setDoc(doc(db, "splitSettings", cred.user.uid), {
        emergencyPct: 30,
        savingPct: 40,
        enjoymentPct: 30,
      });
    }
    setProfile(userDoc);
    return cred.user;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  const value = { currentUser, profile, loading, signup, login, logout };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
