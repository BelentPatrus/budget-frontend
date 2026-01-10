"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type RegisterResponse = any; // you can type this later once your API response shape is stable

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Point this to your Spring API base (proxy or direct)
  // Example if you proxy /api -> backend: `"/api"`
  // Example direct local backend: `"http://localhost:8080"`
  const API_BASE = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const u = username.trim();
    if (!u) return setError("Username is required.");
    if (!password) return setError("Password is required.");
    if (password.length < 2) return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Match your Spring controller signature: @RequestBody Users user
        body: JSON.stringify({ username: u, password }),
      });

      if (!res.ok) {
        // Try to read a message, otherwise fall back
        const text = await res.text().catch(() => "");
        throw new Error(text || `Register failed (${res.status})`);
      }

      const data: RegisterResponse = await res.json().catch(() => null);
      setSuccessMsg("Account created! Redirecting to login…");

      // small UX pause, optional
      setTimeout(() => router.push("/login"), 600);

      return data;
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white shadow-sm p-6">
        <h1 className="text-2xl font-semibold">Register</h1>
        <p className="text-sm text-gray-600 mt-1">Create an account with a username and password.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Username</label>
            <input
              className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. username"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={loading}
            />
            <p className="text-xs text-gray-500">Minimum 6 characters for now.</p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {successMsg}
            </div>
          )}

          <button
            className="w-full rounded-xl bg-black text-white py-2 font-medium disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <button
            className="w-full rounded-xl border py-2 font-medium"
            type="button"
            onClick={() => router.push("/login")}
            disabled={loading}
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}
