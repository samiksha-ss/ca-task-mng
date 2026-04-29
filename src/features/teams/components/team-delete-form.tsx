"use client";

import { useActionState } from "react";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { deleteTeamAction, type TeamAdminActionState } from "../actions";

const initialState: TeamAdminActionState = {
  error: null,
  success: null,
};

type TeamDeleteFormProps = {
  teamId: string;
};

export function TeamDeleteForm({ teamId }: TeamDeleteFormProps) {
  const [state, formAction] = useActionState(deleteTeamAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="teamId" value={teamId} />
      <p className="text-sm leading-6 text-muted-foreground">
        Deleting a team clears team links from related members and tasks that point
        at it through the current schema.
      </p>
      {state.error ? <AuthStatusMessage tone="error" message={state.error} /> : null}
      <AuthSubmitButton idleLabel="Delete team" pendingLabel="Deleting..." />
    </form>
  );
}
