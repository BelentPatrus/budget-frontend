"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const { user } = useAuth();

  async function handleLogout() {
    await fetch("http://localhost:8080/logout", {
      method: "POST",
      credentials: "include",
    });

    router.replace("/login");
    router.refresh(); // 👈 forces layout + guard re-run
  }

  return (
    <nav className="flex items-center gap-2">
      <Link href="/settings" className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
      {user?.username}
      </Link>
      <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
        Dashboard
      </Link>
      <Link href="/transactions" className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
        Transactions
      </Link>
      <Link href="/budgets" className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
        Budgets
      </Link>
      <Link href="/SummaryAccounts" className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
        Summary Of Accounts
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
