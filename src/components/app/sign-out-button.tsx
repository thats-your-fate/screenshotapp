import { signOutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export function SignOutButton({ label = "Sign out" }: { label?: string }) {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="ghost" className="border border-slate-200">
        {label}
      </Button>
    </form>
  );
}
