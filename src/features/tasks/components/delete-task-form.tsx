"use client";

import { useActionState } from "react";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { type TaskActionState, deleteTaskAction } from "../actions";

const initialState: TaskActionState = {
  error: null,
  success: null,
};

type DeleteTaskFormProps = {
  taskId: string;
};

export function DeleteTaskForm({ taskId }: DeleteTaskFormProps) {
  const [state, formAction] = useActionState(deleteTaskAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="taskId" value={taskId} />
      <p className="text-sm leading-6 text-muted-foreground">
        This permanently removes the task from the current workspace. Only
        admins and managers can perform this action.
      </p>

      {state.error ? (
        <AuthStatusMessage tone="error" message={state.error} />
      ) : null}

      <AuthSubmitButton idleLabel="Delete task" pendingLabel="Deleting..." />
    </form>
  );
}
