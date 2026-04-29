import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { TaskPriorityBadge } from "@/features/tasks/components/task-priority-badge";
import { TaskStatusBadge } from "@/features/tasks/components/task-status-badge";
import { requireCurrentUserContext } from "@/lib/auth/session";
import { getTaskDetailPath } from "@/lib/constants/routes";
import { pageIdentities } from "@/lib/constants/page-identities";
import { getDashboardPageData } from "@/services/dashboard-service";
import { getTaskPageData } from "@/services/task-service";

export default async function NotificationsPage() {
  const identity = pageIdentities.notifications;
  const IdentityIcon = identity.icon;
  const context = await requireCurrentUserContext();
  const [dashboard, taskData] = await Promise.all([
    getDashboardPageData(context),
    getTaskPageData(200),
  ]);

  const tasks = taskData.tasks;
  const assignedToMe = tasks.filter((task) => task.assigned_to === context.user.id);
  const unassigned = tasks.filter((task) => !task.assigned_to).slice(0, 6);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={identity.eyebrow}
        title="Notifications"
        description="This view surfaces live attention areas derived from task deadlines, assignments, and workflow state in your visible scope."
        icon={<IdentityIcon className="h-5 w-5" />}
        tone={identity.tone}
      />

      {dashboard.error ? <AuthStatusMessage tone="info" message={dashboard.error} /> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Overdue alerts"
          value={String(dashboard.overdueTasks.length)}
          hint="Visible tasks already past their due date"
        />
        <StatCard
          label="Due soon alerts"
          value={String(dashboard.dueSoonTasks.length)}
          hint="Visible tasks due within the next 7 days"
        />
        <StatCard
          label="Assigned to you"
          value={String(assignedToMe.length)}
          hint="Visible tasks currently assigned to your user"
        />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1fr_1fr_1fr]">
        <article className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Critical</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Overdue tasks
          </h2>

          <div className="mt-6 space-y-4">
            {dashboard.overdueTasks.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
                No overdue tasks need attention right now.
              </div>
            ) : (
              dashboard.overdueTasks.map((task) => (
                <Link
                  key={task.id}
                  href={getTaskDetailPath(task.id)}
                  className="block rounded-[22px] border border-border bg-background p-4 transition hover:border-accent"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <TaskStatusBadge status={task.status} />
                    <TaskPriorityBadge priority={task.priority} />
                  </div>
                  <h3 className="mt-3 text-base font-semibold">{task.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Due {task.due_date} • {task.assignee_name ?? "Unassigned"}
                  </p>
                </Link>
              ))
            )}
          </div>
        </article>

        <article className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Due this week
          </h2>

          <div className="mt-6 space-y-4">
            {dashboard.dueSoonTasks.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
                No upcoming deadline alerts are visible.
              </div>
            ) : (
              dashboard.dueSoonTasks.map((task) => (
                <Link
                  key={task.id}
                  href={getTaskDetailPath(task.id)}
                  className="block rounded-[22px] border border-border bg-background p-4 transition hover:border-accent"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <TaskStatusBadge status={task.status} />
                    <TaskPriorityBadge priority={task.priority} />
                  </div>
                  <h3 className="mt-3 text-base font-semibold">{task.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Due {task.due_date} • {task.company_name ?? "No company linked"}
                  </p>
                </Link>
              ))
            )}
          </div>
        </article>

        <article className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Assignment</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Your queue and gaps
          </h2>

          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Assigned to you
              </h3>
              {assignedToMe.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
                  No currently visible tasks are assigned to you.
                </div>
              ) : (
                assignedToMe.slice(0, 6).map((task) => (
                  <Link
                    key={task.id}
                    href={getTaskDetailPath(task.id)}
                    className="block rounded-[22px] border border-border bg-background p-4 transition hover:border-accent"
                  >
                    <h4 className="text-base font-semibold">{task.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {task.status.replaceAll("_", " ")} • {task.due_date ?? "No deadline"}
                    </p>
                  </Link>
                ))
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Unassigned work
              </h3>
              {unassigned.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
                  No unassigned tasks are visible in your current scope.
                </div>
              ) : (
                unassigned.map((task) => (
                  <Link
                    key={task.id}
                    href={getTaskDetailPath(task.id)}
                    className="block rounded-[22px] border border-border bg-background p-4 transition hover:border-accent"
                  >
                    <h4 className="text-base font-semibold">{task.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {task.company_name ?? "No company linked"} • {task.priority}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
