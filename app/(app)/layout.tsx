import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
     <AuthGuard>
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Budget App</p>
            <p className="text-xs text-slate-600">Demo mode</p>
          </div>

          <Navbar />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </main>
    {children}</AuthGuard>
  );
}
