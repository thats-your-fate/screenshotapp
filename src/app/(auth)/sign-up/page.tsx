import Link from "next/link";

import { SignUpForm } from "@/components/auth-form";
import { signUpAction } from "@/features/auth/actions";

export default function SignUpPage() {
  return (
    <div>
      <h1 className="text-2xl text-slate-900">Create account</h1>
      <p className="mt-1 text-sm text-slate-600">Start generating App Store screenshots from templates.</p>
      <div className="mt-6">
        <SignUpForm action={signUpAction} />
      </div>
      <p className="mt-4 text-sm text-slate-600">
        Already registered? <Link href="/sign-in" className="font-semibold text-slate-900">Sign in</Link>
      </p>
    </div>
  );
}
