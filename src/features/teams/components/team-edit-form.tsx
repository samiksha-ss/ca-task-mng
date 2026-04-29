"use client";

import { useActionState } from "react";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import type { MemberSummary, TeamSummary } from "@/services/team-service";
import { type TeamAdminActionState, updateTeamAction } from "../actions";

const initialState: TeamAdminActionState = {
  error: null,
  success: null,
};

type TeamEditFormProps = {
  team: TeamSummary;
  members: MemberSummary[];
};

export function TeamEditForm({ team, members }: TeamEditFormProps) {
  const [state, formAction] = useActionState(updateTeamAction, initialState);
  const managerOptions = members.filter((member) =>
    ["admin", "manager"].includes(member.role),
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="teamId" value={team.id} />

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Team name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={team.name}
          className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={team.description ?? ""}
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="managerId" className="text-sm font-medium">
          Manager
        </label>
        <select
          id="managerId"
          name="managerId"
          defaultValue={team.manager_id ?? ""}
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

      {state.error ? <AuthStatusMessage tone="error" message={state.error} /> : null}
      {state.success ? (
        <AuthStatusMessage tone="success" message={state.success} />
      ) : null}

      <AuthSubmitButton idleLabel="Save team" pendingLabel="Saving..." />
    </form>
  );
}
