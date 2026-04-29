import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { TaskPriorityBadge } from "@/features/tasks/components/task-priority-badge";
import { TaskStatusBadge } from "@/features/tasks/components/task-status-badge";
import { requireCurrentUserContext } from "@/lib/auth/session";
import {
  COMPANIES_PATH,
  MEMBERS_PATH,
  TASKS_PATH,
  TEAMS_PATH,
  getTaskDetailPath,
} from "@/lib/constants/routes";
import { pageIdentities } from "@/lib/constants/page-identities";
import { getDashboardPageData } from "@/services/dashboard-service";

export default async function DashboardPage() {
  const identity = pageIdentities.dashboard;
  const IdentityIcon = identity.icon;
  const context = await requireCurrentUserContext();
  const data = await getDashboardPageData(context);
  const displayName = context.profile?.full_name ?? context.profile?.email ?? "Team";
  const metricNumbers = data.metrics.map((metric) => Number(metric.value) || 0);
  const maxMetric = Math.max(...metricNumbers, 1);

  return (
    <section className="flex flex-1 flex-col gap-6">
      <PageHeader
        eyebrow={identity.eyebrow}
        title="Dashboard"
        description={data.summaryBody}
        icon={<IdentityIcon className="h-5 w-5" />}
        tone={identity.tone}
        action={
          <Link
            href={TASKS_PATH}
            className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground"
          >
            Open task module
          </Link>
        }
      />

      {data.error ? <AuthStatusMessage tone="info" message={data.error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <article className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent/90">
                Priority workspace
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                Hello, {displayName}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                Your project command center is ready. Focus on priority tasks, stay ahead of deadlines, and keep your team aligned.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={TASKS_PATH}
                className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground"
              >
                View tasks
              </Link>
              <Link
                href={COMPANIES_PATH}
                className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-medium"
              >
                Companies
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] bg-slate-950/5 p-4">
              <p className="text-sm text-muted-foreground">Current scope</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{data.scopeLabel}</p>
            </div>
            <div className="rounded-[24px] bg-slate-950/5 p-4">
              <p className="text-sm text-muted-foreground">Visible tasks</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{data.metrics[0]?.value}</p>
            </div>
            <div className="rounded-[24px] bg-slate-950/5 p-4">
              <p className="text-sm text-muted-foreground">Upcoming deadlines</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{data.dueSoonTasks.length}</p>
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Project progress</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Focus metrics</h2>
            </div>
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Live
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {data.metrics.map((metric) => {
              const value = Number(metric.value) || 0;
              const width = Math.max(12, Math.round((value / maxMetric) * 100));

              return (
                <div key={metric.label}>
                  <div className="flex items-center justify-between gap-4 text-sm font-medium text-foreground">
                    <span>{metric.label}</span>
                    <span>{metric.value}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted/60">
                    <div
                      className="h-2 rounded-full bg-accent transition-all"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <div className="grid gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {data.metrics.slice(0, 2).map((metric) => (
              <StatCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                hint={metric.hint}
              />
            ))}
          </div>

          <article className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reminders</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Upcoming deadlines
                </h2>
              </div>
              <Link href={TASKS_PATH} className="text-sm font-medium text-accent">
                Manage tasks
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {data.dueSoonTasks.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
                  No deadlines in the next week.
                </div>
              ) : (
                data.dueSoonTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={getTaskDetailPath(task.id)}
                    className="block rounded-[22px] border border-border bg-background p-4 transition hover:border-accent"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <TaskStatusBadge status={task.status} />
                      <TaskPriorityBadge priority={task.priority} />
                    </div>
                    <h3 className="mt-3 text-lg font-semibold">{task.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Due {task.due_date}</p>
                  </Link>
                ))
              )}
            </div>
          </article>

          <article className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team pulse</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Recent activity</h2>
              </div>
              <Link href={TASKS_PATH} className="text-sm font-medium text-accent">
                View tasks
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {data.recentTasks.slice(0, 4).map((task) => (
                <Link
                  key={task.id}
                  href={getTaskDetailPath(task.id)}
                  className="grid gap-2 rounded-[22px] border border-border bg-background p-4 transition hover:border-accent"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-foreground">{task.title}</h3>
                    <span className="text-xs uppercase text-muted-foreground">
                      {task.due_date ?? "No due date"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <TaskStatusBadge status={task.status} />
                    <TaskPriorityBadge priority={task.priority} />
                  </div>
                </Link>
              ))}
            </div>
          </article>
        </div>

        <article className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Executive summary</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Performance at a glance</h2>
            </div>
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Insight
            </span>
          </div>

          <div className="mt-6 space-y-6">
            <div className="rounded-[24px] bg-slate-950/5 p-5">
              <p className="text-sm text-muted-foreground">Workspace overview</p>
              <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Active companies</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{data.companies.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Recent tasks</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{data.recentTasks.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[24px] bg-slate-950/5 p-5">
              <p className="text-sm font-medium text-muted-foreground">Need attention</p>
              <div className="mt-3 flex flex-col gap-3 text-sm text-foreground">
                <div className="flex items-center justify-between rounded-2xl bg-background/80 p-3">
                  <span>Overdue tasks</span>
                  <strong>{data.overdueTasks.length}</strong>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-background/80 p-3">
                  <span>Next 7 days</span>
                  <strong>{data.dueSoonTasks.length}</strong>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
