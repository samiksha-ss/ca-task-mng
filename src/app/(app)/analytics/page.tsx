import { PageHeader } from "@/components/layout/page-header";
import { getTaskPageData } from "@/services/task-service";
import { getUserContext, requireCurrentUserContext } from "@/lib/auth/session";
import { BarChart3, TrendingUp, CheckCircle, AlertCircle, Clock, Percent } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";

export default async function AnalyticsPage() {
  const userContext = await getUserContext();
  const context = await requireCurrentUserContext();
  const { tasks, stats, error } = await getTaskPageData(userContext, 1000); // Fetch all tasks

  if (error) {
    return (
      <div className="p-6">
        <PageHeader eyebrow="Insights" title="Analytics" description="Productivity and estimation metrics." />
        <div className="rounded-[28px] border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => ["in_progress", "in_review"].includes(t.status)).length;
  const backlog = tasks.filter((t) => t.status === "backlog").length;
  const todo = tasks.filter((t) => t.status === "todo").length;
  const blocked = tasks.filter((t) => t.status === "blocked").length;

  const low = tasks.filter((t) => t.priority === "low").length;
  const medium = tasks.filter((t) => t.priority === "medium").length;
  const high = tasks.filter((t) => t.priority === "high").length;
  const urgent = tasks.filter((t) => t.priority === "urgent").length;

  const totalEstimatedMin = tasks.reduce((sum, t) => sum + (t.estimated_minutes || 0), 0);
  const totalActualMin = tasks.reduce((sum, t) => sum + (t.actual_minutes || 0), 0);

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const formatHours = (min: number) => (min / 60).toFixed(1);

  // Status chart percentages
  const getPercent = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Insights"
        title="Workspace Analytics"
        description="Monitor accounting team velocity, budget estimations vs. logged actual hours, and delivery throughput."
      />

      {/* Dynamic Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completion Rate</span>
            <h3 className="text-2xl font-black mt-0.5">{completionRate}%</h3>
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completed Tasks</span>
            <h3 className="text-2xl font-black mt-0.5">{completed}</h3>
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estimated Hours</span>
            <h3 className="text-2xl font-black mt-0.5">{formatHours(totalEstimatedMin)}h</h3>
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Logged Hours</span>
            <h3 className="text-2xl font-black mt-0.5">{formatHours(totalActualMin)}h</h3>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Card: Status Distribution */}
        <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Workload Status Distribution</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Summary of task phases in current scope.</p>
          </div>

          <div className="space-y-4">
            {/* Backlog */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Backlog</span>
                <span>{backlog} tasks ({getPercent(backlog)}%)</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full transition-all" style={{ width: `${getPercent(backlog)}%` }} />
              </div>
            </div>

            {/* Todo */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Todo / Drafts</span>
                <span>{todo} tasks ({getPercent(todo)}%)</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${getPercent(todo)}%` }} />
              </div>
            </div>

            {/* In Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">In Progress</span>
                <span>{inProgress} tasks ({getPercent(inProgress)}%)</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${getPercent(inProgress)}%` }} />
              </div>
            </div>

            {/* Blocked */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Blocked / Paused</span>
                <span>{blocked} tasks ({getPercent(blocked)}%)</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-red-400 rounded-full transition-all" style={{ width: `${getPercent(blocked)}%` }} />
              </div>
            </div>

            {/* Completed */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Done / Finished</span>
                <span>{completed} tasks ({getPercent(completed)}%)</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${getPercent(completed)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Priority & Time Estimations */}
        <div className="space-y-6">
          {/* Priority Breakdown */}
          <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Priority Distribution</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-100/10 border border-slate-500/10 text-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Low</span>
                <p className="text-2xl font-black mt-1">{low}</p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-100/10 border border-blue-500/10 text-center">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Medium</span>
                <p className="text-2xl font-black mt-1 text-blue-500">{medium}</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-100/10 border border-amber-500/10 text-center">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">High</span>
                <p className="text-2xl font-black mt-1 text-amber-500">{high}</p>
              </div>
              <div className="p-4 rounded-2xl bg-red-100/10 border border-red-500/10 text-center">
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Urgent</span>
                <p className="text-2xl font-black mt-1 text-red-500">{urgent}</p>
              </div>
            </div>
          </div>

          {/* Time Efficiency Summary */}
          <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Time Budget Accuracy</h2>
            <p className="text-xs text-muted-foreground">Comparing estimated budgets vs. actual logged time.</p>
            {totalEstimatedMin > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Overall Budget Consumed</span>
                  <span>{Math.round((totalActualMin / totalEstimatedMin) * 100)}%</span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={[
                      "h-full rounded-full transition-all",
                      totalActualMin > totalEstimatedMin ? "bg-red-500" : "bg-accent",
                    ].join(" ")}
                    style={{ width: `${Math.min(Math.round((totalActualMin / totalEstimatedMin) * 100), 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-2">No estimation values have been assigned to workspace tasks yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Task Performance Table */}
      <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Task Budget Tracking Directory</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Top delivery estimates against actual logged entries.</p>
          </div>
        </div>

        {tasks.filter((t) => t.estimated_minutes > 0 || t.actual_minutes > 0).length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No tasks currently have logged minutes or estimation budgets.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse text-left">
              <thead>
                <tr className="border-b border-border/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-4">Task Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Logged</th>
                  <th className="py-3 px-4 w-48">Consumption</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {tasks
                  .filter((t) => t.estimated_minutes > 0 || t.actual_minutes > 0)
                  .slice(0, 10)
                  .map((task) => {
                    const taskPercent = task.estimated_minutes > 0
                      ? Math.min(Math.round((task.actual_minutes / task.estimated_minutes) * 100), 100)
                      : 0;
                    return (
                      <tr key={task.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-foreground/90 max-w-xs truncate">{task.title}</td>
                        <td className="py-3.5 px-4">
                          <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            {task.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">{formatHours(task.estimated_minutes)}h</td>
                        <td className="py-3.5 px-4 font-semibold text-foreground/80">{formatHours(task.actual_minutes)}h</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                              <div
                                className={[
                                  "h-full rounded-full",
                                  task.actual_minutes > task.estimated_minutes ? "bg-red-500" : "bg-accent",
                                ].join(" ")}
                                style={{ width: `${taskPercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground">{taskPercent}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
