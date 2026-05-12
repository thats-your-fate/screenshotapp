import Link from "next/link";

import { SignUpForm } from "@/components/auth-form";
import { signInWithGoogleAction, signUpAction } from "@/features/auth/actions";

export default async function SignUpPage({
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
      <h1 className="text-2xl text-slate-900">Create account</h1>
      <p className="mt-1 text-sm text-slate-600">Start generating App Store screenshots from templates.</p>
      <div className="mt-6">
        <SignUpForm
          action={signUpAction}
          googleAction={signInWithGoogleAction}
          googleEnabled={googleEnabled}
          redirectTo={redirectTo}
        />
      </div>
      <p className="mt-4 text-sm text-slate-600">
        Already registered?{" "}
        <Link
          href={redirectTo ? `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}` : "/sign-in"}
          className="font-semibold text-slate-900"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
