import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student", parentId: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signup(form);
      navigate("/");
    } catch (err) {
      setError("Couldn't create account. The email may already be in use, or the password is too short.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl font-semibold text-emerald mb-1">Create account</h1>
        <p className="text-sm text-ink/60 mb-8">Set up a Parent or Student profile.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">I am a</label>
            <div className="mt-1 flex gap-2">
              {["student", "parent"].map((r) => (
                <button
                  type="button" key={r} onClick={() => update("role", r)}
                  className={`flex-1 rounded-card border py-2 text-sm font-medium capitalize ${
                    form.role === r ? "bg-emerald text-white border-emerald" : "border-mist text-ink/70"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Name</label>
            <input required value={form.name} onChange={(e) => update("name", e.target.value)}
              className="mt-1 w-full rounded-card border border-mist bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald" />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)}
              className="mt-1 w-full rounded-card border border-mist bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald" />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => update("password", e.target.value)}
              className="mt-1 w-full rounded-card border border-mist bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald" />
          </div>

          {form.role === "student" && (
            <div>
              <label className="text-sm font-medium">Parent's User ID (optional, can link later)</label>
              <input value={form.parentId} onChange={(e) => update("parentId", e.target.value)}
                placeholder="Ask your parent for their Firebase UID"
                className="mt-1 w-full rounded-card border border-mist bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald" />
            </div>
          )}

          {error && <p className="text-sm text-clay">{error}</p>}
          <button disabled={busy} className="w-full rounded-card bg-emerald text-white py-2 font-medium hover:opacity-90 disabled:opacity-50">
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-ink/60 mt-6">
          Already have an account? <Link to="/login" className="text-emerald font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
