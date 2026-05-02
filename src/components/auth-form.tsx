"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ActionState = { ok: boolean; error?: string };

export function SignInForm({
  action,
  redirectTo,
}: {
  action: (formData: FormData) => Promise<ActionState>;
  redirectTo?: string;
}) {
  const [state, formAction, pending] = useActionState(
    async (_state: ActionState, formData: FormData) => action(formData),
    { ok: false, error: undefined },
  );

  return (
    <form action={formAction} className="space-y-4">
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
  );
}

export function SignUpForm({ action }: { action: (formData: FormData) => Promise<ActionState> }) {
  const [state, formAction, pending] = useActionState(
    async (_state: ActionState, formData: FormData) => action(formData),
    { ok: false, error: undefined },
  );

  return (
    <form action={formAction} className="space-y-4">
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
  );
}
