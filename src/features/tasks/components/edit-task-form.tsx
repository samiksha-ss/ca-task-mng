"use client";

import { useActionState } from "react";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import type { Company, Profile, Task, Team } from "@/types";
import { type TaskActionState, updateTaskAction } from "../actions";
import { TaskFormFields } from "./task-form-fields";

const initialState: TaskActionState = {
  error: null,
  success: null,
};

type EditTaskFormProps = {
  task: Task;
  teams: Team[];
  companies: Company[];
  assignees: Profile[];
  defaultTeamId?: string | null;
  defaultAssigneeId?: string | null;
  canChooseTeam: boolean;
  canChooseAssignee: boolean;
};

export function EditTaskForm({
  task,
  teams,
  companies,
  assignees,
  defaultTeamId,
  defaultAssigneeId,
  canChooseTeam,
  canChooseAssignee,
}: EditTaskFormProps) {
  const [state, formAction] = useActionState(updateTaskAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="taskId" value={task.id} />

      <TaskFormFields
        task={task}
        teams={teams}
        companies={companies}
        assignees={assignees}
        defaultTeamId={defaultTeamId}
        defaultAssigneeId={defaultAssigneeId}
        canChooseTeam={canChooseTeam}
        canChooseAssignee={canChooseAssignee}
      />

      {state.error ? (
        <AuthStatusMessage tone="error" message={state.error} />
      ) : null}
      {state.success ? (
        <AuthStatusMessage tone="success" message={state.success} />
      ) : null}

      <AuthSubmitButton idleLabel="Save changes" pendingLabel="Saving..." />
    </form>
  );
}
