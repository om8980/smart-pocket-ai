import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError("Couldn't sign in. Check your email and password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl font-semibold text-emerald mb-1">SmartPocket</h1>
        <p className="text-sm text-ink/60 mb-8">Pocket money, split smartly.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-card border border-mist bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-card border border-mist bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald"
            />
          </div>
          {error && <p className="text-sm text-clay">{error}</p>}
          <button disabled={busy} className="w-full rounded-card bg-emerald text-white py-2 font-medium hover:opacity-90 disabled:opacity-50">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-ink/60 mt-6">
          New here? <Link to="/signup" className="text-emerald font-medium">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
