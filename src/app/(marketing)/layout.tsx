import Link from "next/link";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold">AppShot Studio</Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-700">
            <Link href="/templates">Templates</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/sign-in" className="rounded-md border border-slate-300 px-3 py-1.5">Sign in</Link>
            <Link href="/sign-up" className="rounded-md bg-slate-900 px-3 py-1.5 text-white">Start free</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
