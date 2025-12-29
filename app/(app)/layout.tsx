import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Budget App</p>
            <p className="text-xs text-slate-600">Demo mode</p>
          </div>

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
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </main>
  );
}
