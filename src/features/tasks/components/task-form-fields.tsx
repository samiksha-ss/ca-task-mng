import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "@/lib/constants/app";
import type { Company, Profile, Task, Team } from "@/types";

type TaskFormFieldsProps = {
  teams: Team[];
  companies: Company[];
  assignees: Profile[];
  defaultTeamId?: string | null;
  defaultAssigneeId?: string | null;
  canChooseTeam: boolean;
  canChooseAssignee: boolean;
  task?: Task | null;
};

export function TaskFormFields({
  teams,
  companies,
  assignees,
  defaultTeamId,
  defaultAssigneeId,
  canChooseTeam,
  canChooseAssignee,
  task,
}: TaskFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Task title
        </label>
        <input
          id="title"
          name="title"
          placeholder="Prepare GST filing review"
          defaultValue={task?.title ?? ""}
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
          placeholder="Add context, deliverables, or dependencies."
          defaultValue={task?.description ?? ""}
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="companyId" className="text-sm font-medium">
            Company
          </label>
          <select
            id="companyId"
            name="companyId"
            defaultValue={task?.company_id ?? ""}
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
          >
            <option value="">No company selected</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="dueDate" className="text-sm font-medium">
            Due date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={task?.due_date ?? ""}
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="priority" className="text-sm font-medium">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={task?.priority ?? "medium"}
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
          >
            {TASK_PRIORITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={task?.status ?? "todo"}
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
          >
            {TASK_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="estimatedMinutes" className="text-sm font-medium">
            Estimated minutes
          </label>
          <input
            id="estimatedMinutes"
            name="estimatedMinutes"
            type="number"
            min={0}
            defaultValue={task?.estimated_minutes ?? 60}
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="teamId" className="text-sm font-medium">
            Team
          </label>
          <select
            id="teamId"
            name="teamId"
            defaultValue={task?.team_id ?? defaultTeamId ?? ""}
            disabled={!canChooseTeam}
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent disabled:opacity-70"
          >
            <option value="">No team selected</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="assignedTo" className="text-sm font-medium">
          Assignee
        </label>
        <select
          id="assignedTo"
          name="assignedTo"
          defaultValue={task?.assigned_to ?? defaultAssigneeId ?? ""}
          disabled={!canChooseAssignee}
          className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-accent disabled:opacity-70"
        >
          <option value="">Assign later</option>
          {assignees.map((assignee) => (
            <option key={assignee.id} value={assignee.id}>
              {assignee.full_name ?? assignee.email}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm">
        <input
          type="checkbox"
          name="billable"
          defaultChecked={task?.billable ?? false}
          className="h-4 w-4"
        />
        Mark this task as billable work
      </label>
    </>
  );
}
