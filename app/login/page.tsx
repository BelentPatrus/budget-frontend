"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // UI-only: later replace with API call to Spring Boot.
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 md:grid-cols-2">
          {/* Left: branding */}
          <section className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700" />
            <div className="relative flex h-full flex-col justify-between p-10 text-white">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Budget App
                </div>

                <h1 className="mt-6 text-3xl font-semibold tracking-tight">
                  Stay on top of your money.
                </h1>
                <p className="mt-3 max-w-sm text-white/80">
                  Track transactions, set category budgets, and see monthly insights—without
                  spreadsheets chaos.
                </p>

                <ul className="mt-8 space-y-3 text-sm text-white/80">
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/70" />
                    Fast transaction search & filters
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/70" />
                    Category budgets with progress
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/70" />
                    Secure auth (JWT + refresh later)
                  </li>
                </ul>
              </div>

              <p className="text-xs text-white/60">
                Tip: we’ll keep you logged in using refresh tokens (like YouTube).
              </p>
            </div>
          </section>

          {/* Right: form */}
          <section className="p-7 sm:p-10">
            <div className="mx-auto max-w-md">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Sign in
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Use your email and password to continue.
                  </p>
                </div>

                <Link
                  href="/"
                  className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                >
                  Home
                </Link>
              </div>

              <form onSubmit={onSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label
                      className="text-sm font-medium text-slate-700"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-sm text-slate-600 hover:text-slate-900"
                      onClick={() => alert("Later: Forgot password flow")}
                    >
                      Forgot?
                    </button>
                  </div>

                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  Sign in
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs text-slate-500">or</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                  onClick={() => alert("Later: OAuth (Google/Apple)")}
                >
                  Continue with Google
                </button>

                <p className="pt-2 text-center text-sm text-slate-600">
                  Don’t have an account?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-slate-900 underline underline-offset-4"
                  >
                    Create one
                  </Link>
                </p>
              </form>

              <p className="mt-8 text-xs text-slate-500">
                By continuing, you agree to the Terms and acknowledge the Privacy Policy.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
