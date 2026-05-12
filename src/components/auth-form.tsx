"use client";

import { useActionState } from "react";

import { trackEvent } from "@/components/analytics/google-analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ActionState = { ok: boolean; error?: string };

export function SignInForm({
  action,
  googleAction,
  googleEnabled = false,
  redirectTo,
}: {
  action: (formData: FormData) => Promise<ActionState>;
  googleAction?: (formData: FormData) => Promise<void>;
  googleEnabled?: boolean;
  redirectTo?: string;
}) {
  const [state, formAction, pending] = useActionState(
    async (_state: ActionState, formData: FormData) => action(formData),
    { ok: false, error: undefined },
  );

  return (
    <div className="space-y-4">
      {googleEnabled && googleAction ? (
        <>
          <form action={googleAction}>
            <input type="hidden" name="redirectTo" value={redirectTo || "/app"} />
            <Button
              type="submit"
              variant="ghost"
              className="w-full border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
              onClick={() => trackEvent("login_started", { method: "google" })}
            >
              <span className="mr-2 text-base font-bold">G</span>
              Continue with Google
            </Button>
          </form>
          <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>or</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
        </>
      ) : null}

      <form
        action={formAction}
        className="space-y-4"
        onFocus={() => trackEvent("login_form_started", { method: "credentials" })}
      >
        <input type="hidden" name="redirectTo" value={redirectTo || "/app"} />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <Input name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <Input name="password" type="password" required autoComplete="current-password" />
        </div>
        {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}

export function SignUpForm({
  action,
  googleAction,
  googleEnabled = false,
  redirectTo,
}: {
  action: (formData: FormData) => Promise<ActionState>;
  googleAction?: (formData: FormData) => Promise<void>;
  googleEnabled?: boolean;
  redirectTo?: string;
}) {
  const [state, formAction, pending] = useActionState(
    async (_state: ActionState, formData: FormData) => action(formData),
    { ok: false, error: undefined },
  );

  return (
    <div className="space-y-4">
      {googleEnabled && googleAction ? (
        <>
          <form action={googleAction}>
            <input type="hidden" name="redirectTo" value={redirectTo || "/app"} />
            <Button
              type="submit"
              variant="ghost"
              className="w-full border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
              onClick={() => trackEvent("sign_up_started", { method: "google" })}
            >
              <span className="mr-2 text-base font-bold">G</span>
              Proceed with Google
            </Button>
          </form>
          <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>or</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
        </>
      ) : null}

      <form
        action={formAction}
        className="space-y-4"
        onFocus={() => trackEvent("sign_up_form_started", { method: "credentials" })}
      >
        <input type="hidden" name="redirectTo" value={redirectTo || "/app"} />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <Input name="name" required autoComplete="name" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <Input name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <Input name="password" type="password" required autoComplete="new-password" />
        </div>
        {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </div>
  );
}
