import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { DeleteTaskForm } from "@/features/tasks/components/delete-task-form";
import { EditTaskForm } from "@/features/tasks/components/edit-task-form";
import { TaskPriorityBadge } from "@/features/tasks/components/task-priority-badge";
import { TaskStatusBadge } from "@/features/tasks/components/task-status-badge";
import { getUserContext, requireCurrentUserContext } from "@/lib/auth/session";
import { TASKS_PATH } from "@/lib/constants/routes";
import { getTaskDetailData } from "@/services/task-service";

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const userContext = await getUserContext();
  const context = await requireCurrentUserContext();
  const { task, teams, companies, assignees, error } =
    await getTaskDetailData(userContext, taskId);

  if (error) {
    return (
      <section className="space-y-6">
        <PageHeader
          eyebrow="Task workspace"
          title="Task details"
          description="Open a task to review context, make updates, and manage its lifecycle."
        />
        <AuthStatusMessage tone="info" message={error} />
      </section>
    );
  }

  if (!task) {
    notFound();
  }

  const canChooseTeam = context.profile?.role === "admin";
  const canChooseAssignee = context.profile?.role !== "member";
  const canDelete = context.profile?.role === "admin" || context.profile?.role === "manager";

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Task workspace"
        title={task.title}
        description="Review task ownership, status, and delivery details in one place."
        action={
          <Link
            href={TASKS_PATH}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-border px-4 text-sm font-medium transition hover:bg-muted"
          >
            Back to tasks
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <article className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
              {task.billable ? (
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-accent">
                  Billable
                </span>
              ) : null}
            </div>

            <div className="mt-5 space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight">
                Scope and context
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                {task.description ?? "No task description added yet."}
              </p>
            </div>

            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background p-4">
                <dt className="text-muted-foreground">Company</dt>
                <dd className="mt-1 font-medium">
                  {task.company_name ?? "Not linked"}
                </dd>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <dt className="text-muted-foreground">Team</dt>
                <dd className="mt-1 font-medium">
                  {task.team_name ?? "Not linked"}
                </dd>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <dt className="text-muted-foreground">Assignee</dt>
                <dd className="mt-1 font-medium">
                  {task.assignee_name ?? "Unassigned"}
                </dd>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <dt className="text-muted-foreground">Created by</dt>
                <dd className="mt-1 font-medium">
                  {task.creator_name ?? "Unknown"}
                </dd>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <dt className="text-muted-foreground">Due date</dt>
                <dd className="mt-1 font-medium">
                  {formatDate(task.due_date)}
                </dd>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <dt className="text-muted-foreground">Estimate</dt>
                <dd className="mt-1 font-medium">
                  {task.estimated_minutes} minutes
                </dd>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="mt-1 font-medium">
                  {formatDate(task.created_at)}
                </dd>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <dt className="text-muted-foreground">Last updated</dt>
                <dd className="mt-1 font-medium">
                  {formatDate(task.updated_at)}
                </dd>
              </div>
            </dl>
          </article>
        </div>

        <div className="space-y-6">
          <aside className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Task editor
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Update task
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Changes here follow the same role restrictions as the database
                policies, so members can update only their own assigned work.
              </p>
            </div>

            <div className="mt-6">
              <EditTaskForm
                task={task}
                teams={teams}
                companies={companies}
                assignees={assignees}
                defaultTeamId={context.profile?.team_id}
                defaultAssigneeId={context.user.id}
                canChooseTeam={canChooseTeam}
                canChooseAssignee={canChooseAssignee}
              />
            </div>
          </aside>

          {canDelete ? (
            <aside className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Danger zone
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Delete task
                </h2>
              </div>

              <div className="mt-4">
                <DeleteTaskForm taskId={task.id} />
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}
