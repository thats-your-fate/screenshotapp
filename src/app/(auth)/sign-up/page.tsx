import Link from "next/link";

import { SignUpForm } from "@/components/auth-form";
import { signInWithGoogleAction, signUpAction } from "@/features/auth/actions";
import { getAppCopy } from "@/lib/i18n/app";

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
  const { copy } = await getAppCopy();

  return (
    <div>
      <h1 className="text-2xl text-slate-900">{copy.auth.signUpTitle}</h1>
      <p className="mt-1 text-sm text-slate-600">{copy.auth.signUpIntro}</p>
      <div className="mt-6">
        <SignUpForm
          action={signUpAction}
          googleAction={signInWithGoogleAction}
          googleEnabled={googleEnabled}
          redirectTo={redirectTo}
          copy={copy.auth}
        />
      </div>
      <p className="mt-4 text-sm text-slate-600">
        {copy.auth.alreadyRegistered}{" "}
        <Link
          href={redirectTo ? `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}` : "/sign-in"}
          className="font-semibold text-slate-900"
        >
          {copy.auth.signInLink}
        </Link>
      </p>
    </div>
  );
}
