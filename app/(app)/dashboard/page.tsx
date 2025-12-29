function formatMoney(n: number) {
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

type Tx = {
  id: string;
  date: string; // ISO
  merchant: string;
  category: string;
  account: string;
  amount: number; // negative = expense, positive = income
};

export default function DashboardPage() {
  // Mock data (replace later with backend)
  const monthLabel = "December 2025";

  const totals = {
    income: 4200,
    expenses: 2785.43,
    savings: 1414.57,
  };

  const budgets = [
    { category: "Groceries", limit: 450, spent: 392.15 },
    { category: "Dining", limit: 250, spent: 311.9 },
    { category: "Gas", limit: 220, spent: 146.23 },
    { category: "Subscriptions", limit: 75, spent: 62.99 },
  ];

  const recent: Tx[] = [
    { id: "t1", date: "2025-12-27", merchant: "Loblaws", category: "Groceries", account: "TD Chequing", amount: -84.22 },
    { id: "t2", date: "2025-12-27", merchant: "Shell", category: "Gas", account: "TD Visa", amount: -52.1 },
    { id: "t3", date: "2025-12-26", merchant: "Spotify", category: "Subscriptions", account: "TD Visa", amount: -11.99 },
    { id: "t4", date: "2025-12-25", merchant: "Paycheque", category: "Income", account: "TD Chequing", amount: 2100.0 },
    { id: "t5", date: "2025-12-24", merchant: "Kelseys", category: "Dining", account: "TD Visa", amount: -48.75 },
  ];

  const budgetUsedTotal = budgets.reduce((s, b) => s + b.spent, 0);
  const budgetLimitTotal = budgets.reduce((s, b) => s + b.limit, 0);
  const budgetUsedPct = budgetLimitTotal > 0 ? Math.round((budgetUsedTotal / budgetLimitTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-600">{monthLabel}</p>
      </header>

      {/* Top summary cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="Income (month)" value={formatMoney(totals.income)} subtitle="Paycheques & other income" />
        <Card title="Expenses (month)" value={formatMoney(totals.expenses)} subtitle="All spending categories" />
        <Card title="Net (month)" value={formatMoney(totals.savings)} subtitle="Income − Expenses" />
      </section>

      {/* Budget progress + Insights */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Budget progress</h2>
              <p className="text-sm text-slate-600">Top categories this month</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-700">Total used</span>
              <span className="font-medium text-slate-900">
                {formatMoney(budgetUsedTotal)} / {formatMoney(budgetLimitTotal)} ({budgetUsedPct}%)
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-slate-900" style={{ width: `${Math.min(100, budgetUsedPct)}%` }} />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {budgets.map((b) => (
              <BudgetRow key={b.category} category={b.category} spent={b.spent} limit={b.limit} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Insights</h2>
          <p className="text-sm text-slate-600">Quick things to watch</p>

          <div className="mt-4 space-y-3">
            <Insight title="Dining is over budget" detail="You’re 25% over your dining limit. Consider reducing eating out for the rest of the month." />
            <Insight title="Groceries are on track" detail="Groceries are at 87% of budget with a few days left. Keep it tight." />
            <Insight title="Subscriptions look stable" detail="Subscriptions are predictable—good candidate for annual review." />
          </div>
        </div>
      </section>

      {/* Recent transactions */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Recent transactions</h2>
          <p className="text-sm text-slate-600">Last {recent.length} items</p>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Merchant</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Account</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recent.map((t) => (
                <tr key={t.id} className="bg-white">
                  <td className="px-4 py-3 text-slate-700">{formatDate(t.date)}</td>
                  <td className="px-4 py-3 text-slate-900">{t.merchant}</td>
                  <td className="px-4 py-3 text-slate-700">{t.category}</td>
                  <td className="px-4 py-3 text-slate-700">{t.account}</td>
                  <td className={`px-4 py-3 text-right font-medium ${t.amount < 0 ? "text-slate-900" : "text-emerald-700"}`}>
                    {formatMoney(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Card(props: { title: string; value: string; subtitle: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-medium text-slate-700">{props.title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{props.value}</p>
      <p className="mt-1 text-sm text-slate-600">{props.subtitle}</p>
    </div>
  );
}

function BudgetRow(props: { category: string; spent: number; limit: number }) {
  const pct = props.limit > 0 ? Math.round((props.spent / props.limit) * 100) : 0;
  const clamped = Math.min(100, pct);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium text-slate-900">{props.category}</p>
        <p className="text-sm text-slate-700">
          {formatMoney(props.spent)} / {formatMoney(props.limit)} ({pct}%)
        </p>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-slate-900" style={{ width: `${clamped}%` }} />
      </div>
      {pct > 100 ? (
        <p className="mt-2 text-sm text-rose-700">Over budget by {formatMoney(props.spent - props.limit)}</p>
      ) : (
        <p className="mt-2 text-sm text-slate-600">Remaining: {formatMoney(props.limit - props.spent)}</p>
      )}
    </div>
  );
}

function Insight(props: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="font-medium text-slate-900">{props.title}</p>
      <p className="mt-1 text-sm text-slate-700">{props.detail}</p>
    </div>
  );
}
