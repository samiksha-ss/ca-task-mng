"use client";

import { useActionState } from "react";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import type { MemberSummary, TeamSummary } from "@/services/team-service";
import { updateMemberAction, type TeamAdminActionState } from "@/features/teams/actions";

const initialState: TeamAdminActionState = {
  error: null,
  success: null,
};

type MemberManagementFormProps = {
  members: MemberSummary[];
  teams: TeamSummary[];
};

export function MemberManagementForm({
  members,
  teams,
}: MemberManagementFormProps) {
  const [state, formAction] = useActionState(updateMemberAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="memberId" className="text-sm font-medium">
          Member
        </label>
        <select
          id="memberId"
          name="memberId"
          defaultValue=""
          className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
          required
        >
          <option value="" disabled>
            Select a member
          </option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.full_name ?? member.email}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium">
            Role
          </label>
          <select
            id="role"
            name="role"
            defaultValue="member"
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
          >
            <option value="admin">admin</option>
            <option value="manager">manager</option>
            <option value="member">member</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="teamId" className="text-sm font-medium">
            Team
          </label>
          <select
            id="teamId"
            name="teamId"
            defaultValue=""
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
          >
            <option value="">No team assigned</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="jobTitle" className="text-sm font-medium">
          Job title
        </label>
        <input
          id="jobTitle"
          name="jobTitle"
          placeholder="Senior Associate"
          className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
        />
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm">
        <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4" />
        Keep this member active in the workspace
      </label>

      {state.error ? (
        <AuthStatusMessage tone="error" message={state.error} />
      ) : null}
      {state.success ? (
        <AuthStatusMessage tone="success" message={state.success} />
      ) : null}

      <AuthSubmitButton idleLabel="Update member" pendingLabel="Updating..." />
    </form>
  );
}
