"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import { type TaskActionState, deleteTaskAction } from "../actions";
import { RecurrenceEditModal } from "@/components/recurrence/recurrence-edit-modal";

const initialState: TaskActionState = {
  error: null,
  success: null,
};

type DeleteTaskFormProps = {
  taskId: string;
  isRecurring?: boolean;
  taskTitle?: string;
  instanceDate?: string;
};

export function DeleteTaskForm({ 
  taskId,
  isRecurring = false,
  taskTitle = "Task",
  instanceDate = "",
}: DeleteTaskFormProps) {
  const [state, formAction] = useActionState(deleteTaskAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [deleteScope, setDeleteScope] = useState<"one" | "future" | "all" | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (isRecurring && !deleteScope) {
      e.preventDefault();
      setShowRecurrenceModal(true);
    }
  };

  useEffect(() => {
    if (deleteScope && formRef.current) {
      formRef.current.requestSubmit();
    }
  }, [deleteScope]);

  return (
    <>
      <form 
        ref={formRef}
        onSubmit={handleSubmit}
        action={formAction} 
        className="space-y-3"
      >
        <input type="hidden" name="taskId" value={taskId} />
        
        {/* Pass chosen delete parameters to Server Action */}
        <input type="hidden" name="deleteType" value={deleteScope || "one"} />
        <input type="hidden" name="instanceDate" value={instanceDate} />

        <p className="text-sm leading-6 text-muted-foreground">
          This permanently removes the task from the current workspace. Only
          admins and managers can perform this action.
        </p>

        {state.error ? (
          <AuthStatusMessage tone="error" message={state.error} />
        ) : null}

        <AuthSubmitButton idleLabel="Delete task" pendingLabel="Deleting..." />
      </form>

      {showRecurrenceModal && (
        <RecurrenceEditModal
          isOpen={showRecurrenceModal}
          actionType="delete"
          itemName={taskTitle}
          onClose={() => {
            setShowRecurrenceModal(false);
            setDeleteScope(null);
          }}
          onConfirm={(scope) => {
            setDeleteScope(scope);
            setShowRecurrenceModal(false);
          }}
        />
      )}
    </>
  );
}
