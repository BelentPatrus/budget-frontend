"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("http://localhost:8080/logout", {
      method: "POST",
      credentials: "include",
    });

    router.push("/login");
  }

  return (
    <nav className="flex items-center gap-2">
      <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
        Dashboard
      </Link>
      <Link href="/transactions" className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
        Transactions
      </Link>
      <Link href="/budgets" className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
        Budgets
      </Link>
      <Link href="/settings" className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
        Settings
      </Link>

      <button
        onClick={handleLogout}
        className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
      >
        Logout
      </button>
    </nav>
  );
}
