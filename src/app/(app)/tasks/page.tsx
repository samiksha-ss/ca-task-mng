import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { CreateTaskForm } from "@/features/tasks/components/create-task-form";
import { TaskList } from "@/features/tasks/components/task-list";
import { requireCurrentUserContext } from "@/lib/auth/session";
import { getTaskPageData } from "@/services/task-service";

export default async function TasksPage() {
  const context = await requireCurrentUserContext();
  const { tasks, teams, companies, assignees, stats, error } =
    await getTaskPageData();

  const canChooseTeam = context.profile?.role === "admin";
  const canChooseAssignee = context.profile?.role !== "member";

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Task workspace"
        title="Tasks"
        description="Start the first real task workflow: create assignments, monitor progress, and organize work by company, team, and assignee."
      />

      {error ? <AuthStatusMessage tone="info" message={error} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total tasks"
          value={String(stats.total)}
          hint="Tasks currently visible to your role"
        />
        <StatCard
          label="Completed"
          value={String(stats.completed)}
          hint="Finished work items in your current scope"
        />
        <StatCard
          label="In progress"
          value={String(stats.inProgress)}
          hint="Tasks actively moving through execution"
        />
        <StatCard
          label="Overdue"
          value={String(stats.overdue)}
          hint="Open items past their due date"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <TaskList tasks={tasks} />
        </div>

        <aside className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Quick create
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Create a task
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Add a new work item to the workspace. Existing tasks can now be
              opened for full detail, editing, and role-aware deletion.
            </p>
          </div>

          <div className="mt-6">
            <CreateTaskForm
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
      </div>
    </section>
  );
}
