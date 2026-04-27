"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LOGIN_PATH, FORGOT_PASSWORD_PATH } from "@/lib/constants/routes";
import type { AuthActionState } from "@/types/auth";
import { signInAction } from "../actions";
import { AuthStatusMessage } from "./auth-status-message";
import { AuthSubmitButton } from "./auth-submit-button";

const initialState: AuthActionState = {
  error: null,
  success: null,
};

type SignInFormProps = {
  nextPath?: string;
};

export function SignInForm({ nextPath }: SignInFormProps) {
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={nextPath ?? ""} />
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@firm.com"
          className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none ring-0 placeholder:text-muted-foreground/70 focus:border-accent"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Link
            href={FORGOT_PASSWORD_PATH}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none ring-0 placeholder:text-muted-foreground/70 focus:border-accent"
          required
        />
      </div>

      {state.error ? (
        <AuthStatusMessage tone="error" message={state.error} />
      ) : null}
      {state.success ? (
        <AuthStatusMessage tone="success" message={state.success} />
      ) : null}

      <AuthSubmitButton idleLabel="Sign in" pendingLabel="Signing in..." />

      <p className="text-sm text-muted-foreground">
        Protected app entrypoint:{" "}
        <Link href={LOGIN_PATH} className="text-foreground underline">
          session-based access
        </Link>
      </p>
    </form>
  );
}
