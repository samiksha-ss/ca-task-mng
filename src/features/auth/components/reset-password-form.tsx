"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LOGIN_PATH } from "@/lib/constants/routes";
import type { AuthActionState } from "@/types/auth";
import { resetPasswordAction } from "../actions";
import { AuthStatusMessage } from "./auth-status-message";
import { AuthSubmitButton } from "./auth-submit-button";

const initialState: AuthActionState = {
  error: null,
  success: null,
};

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Minimum 8 characters"
          className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none ring-0 placeholder:text-muted-foreground/70 focus:border-accent"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
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

      <AuthSubmitButton
        idleLabel="Update password"
        pendingLabel="Updating password..."
      />

      <Link
        href={LOGIN_PATH}
        className="inline-flex text-sm text-muted-foreground hover:text-foreground"
      >
        Return to login
      </Link>
    </form>
  );
}
