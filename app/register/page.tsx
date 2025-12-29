import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-4">
        <div className="w-full rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-semibold text-slate-900">Register (UI next)</h1>
          <p className="mt-2 text-sm text-slate-600">
            We’ll build this after login.
          </p>
          <Link
            className="mt-6 inline-block rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            href="/login"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
