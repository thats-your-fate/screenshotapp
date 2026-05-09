import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-start justify-center px-6 py-12 lg:pt-28">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-block text-sm font-semibold text-slate-600">Back to site</Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
