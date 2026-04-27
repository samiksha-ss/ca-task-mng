"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LOGIN_PATH } from "@/lib/constants/routes";
import type { AuthActionState } from "@/types/auth";
import { forgotPasswordAction } from "../actions";
import { AuthStatusMessage } from "./auth-status-message";
import { AuthSubmitButton } from "./auth-submit-button";

const initialState: AuthActionState = {
  error: null,
  success: null,
};

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(
    forgotPasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
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

      {state.error ? (
        <AuthStatusMessage tone="error" message={state.error} />
      ) : null}
      {state.success ? (
        <AuthStatusMessage tone="success" message={state.success} />
      ) : null}

      <AuthSubmitButton
        idleLabel="Send reset email"
        pendingLabel="Sending link..."
      />

      <Link
        href={LOGIN_PATH}
        className="inline-flex text-sm text-muted-foreground hover:text-foreground"
      >
        Back to login
      </Link>
    </form>
  );
}
