import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { TaskPriorityBadge } from "@/features/tasks/components/task-priority-badge";
import { TaskStatusBadge } from "@/features/tasks/components/task-status-badge";
import { requireCurrentUserContext } from "@/lib/auth/session";
import { pageIdentities } from "@/lib/constants/page-identities";
import { getDashboardPageData } from "@/services/dashboard-service";
import { getTaskPageData } from "@/services/task-service";
import { getTeamDirectoryData } from "@/services/team-service";

export default async function AnalyticsPage() {
  const identity = pageIdentities.analytics;
  const IdentityIcon = identity.icon;
  const context = await requireCurrentUserContext();
  const [dashboard, taskData, teamData] = await Promise.all([
    getDashboardPageData(context),
    getTaskPageData(200),
    getTeamDirectoryData(),
  ]);

  const tasks = taskData.tasks;
  const completionRate =
    tasks.length === 0 ? 0 : Math.round((taskData.stats.completed / tasks.length) * 100);
  const unassignedTasks = tasks.filter((task) => !task.assigned_to).length;
  const billableTasks = tasks.filter((task) => task.billable).length;
  const blockedTasks = tasks.filter((task) => task.status === "blocked");
  const roleMix = {
    admin: teamData.members.filter((member) => member.role === "admin").length,
    manager: teamData.members.filter((member) => member.role === "manager").length,
    member: teamData.members.filter((member) => member.role === "member").length,
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={identity.eyebrow}
        title="Analytics"
        description="Review live workload, completion, staffing, and delivery pressure using the data visible to your current role."
        icon={<IdentityIcon className="h-5 w-5" />}
        tone={identity.tone}
      />

      {dashboard.error ? <AuthStatusMessage tone="info" message={dashboard.error} /> : null}

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          label="Completion rate"
          value={`${completionRate}%`}
          hint="Share of visible tasks already completed"
        />
        <StatCard
          label="Unassigned tasks"
          value={String(unassignedTasks)}
          hint="Open work items that do not yet have an assignee"
        />
        <StatCard
          label="Billable tasks"
          value={String(billableTasks)}
          hint="Visible tasks currently marked billable"
        />
        <StatCard
          label="Blocked tasks"
          value={String(blockedTasks.length)}
          hint="Visible work currently waiting on a dependency"
        />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Status distribution
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Current workflow mix
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              "backlog",
              "todo",
              "in_progress",
              "in_review",
              "blocked",
              "done",
            ].map((status) => {
              const count = tasks.filter((task) => task.status === status).length;
              return (
                <div
                  key={status}
                  className="rounded-[22px] border border-border bg-background p-4"
                >
                  <TaskStatusBadge status={status as typeof tasks[number]["status"]} />
                  <p className="mt-3 text-3xl font-semibold tracking-tight">{count}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Visible tasks in this state
                  </p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Staffing mix</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Visible role distribution
          </h2>

          <div className="mt-6 space-y-4">
            {Object.entries(roleMix).map(([role, count]) => (
              <div
                key={role}
                className="flex items-center justify-between rounded-[22px] border border-border bg-background px-4 py-4"
              >
                <span className="text-sm font-medium capitalize">{role}</span>
                <span className="text-2xl font-semibold tracking-tight">{count}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Priority pressure
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Priority distribution
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {["low", "medium", "high", "urgent"].map((priority) => {
              const count = tasks.filter((task) => task.priority === priority).length;
              return (
                <div
                  key={priority}
                  className="rounded-[22px] border border-border bg-background p-4"
                >
                  <TaskPriorityBadge
                    priority={priority as typeof tasks[number]["priority"]}
                  />
                  <p className="mt-3 text-3xl font-semibold tracking-tight">{count}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Visible tasks at this priority
                  </p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Risk watch</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Blocked task list
          </h2>

          <div className="mt-6 space-y-4">
            {blockedTasks.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
                No blocked tasks are visible in your current scope.
              </div>
            ) : (
              blockedTasks.slice(0, 8).map((task) => (
                <div
                  key={task.id}
                  className="rounded-[22px] border border-border bg-background p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <TaskStatusBadge status={task.status} />
                    <TaskPriorityBadge priority={task.priority} />
                  </div>
                  <h3 className="mt-3 text-base font-semibold">{task.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {task.assignee_name ?? "Unassigned"} • {task.company_name ?? "No company linked"}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
