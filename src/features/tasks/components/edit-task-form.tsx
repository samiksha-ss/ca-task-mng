"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { AuthSubmitButton } from "@/features/auth/components/auth-submit-button";
import type { Company, Profile, Task, Team } from "@/types";
import { type TaskActionState, updateTaskAction } from "../actions";
import { TaskFormFields } from "./task-form-fields";
import { RecurrenceEditModal } from "@/components/recurrence/recurrence-edit-modal";

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
  const formRef = useRef<HTMLFormElement>(null);
  
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [chosenScope, setChosenScope] = useState<"one" | "future" | "all" | null>(null);

  const isRecurring = task.recurrence_parent_id || (task.recurrence_interval_type && task.recurrence_interval_type !== "none");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (isRecurring && !chosenScope) {
      e.preventDefault();
      setShowRecurrenceModal(true);
    }
  };

  useEffect(() => {
    if (chosenScope && formRef.current) {
      formRef.current.requestSubmit();
    }
  }, [chosenScope]);

  return (
    <>
      <form 
        ref={formRef}
        onSubmit={handleSubmit}
        action={formAction} 
        className="space-y-4"
      >
        <input type="hidden" name="taskId" value={task.id} />
        
        {/* Pass chosen scope parameters to Server Action */}
        <input type="hidden" name="editType" value={chosenScope || "one"} />
        <input type="hidden" name="instanceDate" value={task.due_date || ""} />

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

      {showRecurrenceModal && (
        <RecurrenceEditModal
          isOpen={showRecurrenceModal}
          actionType="edit"
          itemName={task.title}
          onClose={() => {
            setShowRecurrenceModal(false);
            setChosenScope(null);
          }}
          onConfirm={(scope) => {
            setChosenScope(scope);
            setShowRecurrenceModal(false);
          }}
        />
      )}
    </>
  );
}
