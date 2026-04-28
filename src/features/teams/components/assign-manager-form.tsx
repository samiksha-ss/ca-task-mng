"use client";

import { useActionState } from "react";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import type { MemberSummary, TeamSummary } from "@/services/team-service";
import { assignManagerAction, type TeamAdminActionState } from "../actions";

const initialState: TeamAdminActionState = {
  error: null,
  success: null,
};

type AssignManagerFormProps = {
  teams: TeamSummary[];
  members: MemberSummary[];
};

export function AssignManagerForm({
  teams,
  members,
}: AssignManagerFormProps) {
  const [state, formAction] = useActionState(assignManagerAction, initialState);
  const managerOptions = members.filter((member) =>
    ["admin", "manager"].includes(member.role),
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="teamId" className="text-sm font-medium">
          Team
        </label>
        <select
          id="teamId"
          name="teamId"
          defaultValue=""
          className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
          required
        >
          <option value="" disabled>
            Select a team
          </option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="managerId" className="text-sm font-medium">
          Manager
        </label>
        <select
          id="managerId"
          name="managerId"
          defaultValue=""
          className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
        >
          <option value="">No manager assigned</option>
          {managerOptions.map((member) => (
            <option key={member.id} value={member.id}>
              {member.full_name ?? member.email} ({member.role})
            </option>
          ))}
        </select>
      </div>

      {state.error ? (
        <AuthStatusMessage tone="error" message={state.error} />
      ) : null}
      {state.success ? (
        <AuthStatusMessage tone="success" message={state.success} />
      ) : null}

      <AuthSubmitButton
        idleLabel="Update manager"
        pendingLabel="Updating..."
      />
    </form>
  );
}
