import Link from "next/link";

import { SignInForm } from "@/components/auth-form";
import { signInAction, signInWithGoogleAction } from "@/features/auth/actions";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  const googleEnabled = Boolean(
    (process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID) &&
      (process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET),
  );

  return (
    <div>
      <h1 className="text-2xl text-slate-900">Sign in</h1>
      <p className="mt-1 text-sm text-slate-600">Access your template workspace.</p>
      <div className="mt-6">
        <SignInForm
          action={signInAction}
          googleAction={signInWithGoogleAction}
          googleEnabled={googleEnabled}
          redirectTo={redirectTo}
        />
      </div>
      <p className="mt-4 text-sm text-slate-600">
        No account?{" "}
        <Link
          href={redirectTo ? `/sign-up?redirectTo=${encodeURIComponent(redirectTo)}` : "/sign-up"}
          className="font-semibold text-slate-900"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
