"use client";

import { useActionState } from "react";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import type { Profile } from "@/types";
import { type SettingsActionState, updateProfileAction } from "../actions";

const initialState: SettingsActionState = {
  error: null,
  success: null,
};

type ProfileSettingsFormProps = {
  profile: Profile | null;
};

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm font-medium">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          defaultValue={profile?.full_name ?? ""}
          className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="jobTitle" className="text-sm font-medium">
          Job title
        </label>
        <input
          id="jobTitle"
          name="jobTitle"
          defaultValue={profile?.job_title ?? ""}
          className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
        />
      </div>

      {state.error ? <AuthStatusMessage tone="error" message={state.error} /> : null}
      {state.success ? (
        <AuthStatusMessage tone="success" message={state.success} />
      ) : null}

      <AuthSubmitButton idleLabel="Save profile" pendingLabel="Saving..." />
    </form>
  );
}
