import { PageHeader } from "@/components/layout/page-header";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { CreateTaskForm } from "@/features/tasks/components/create-task-form";
import { TaskList } from "@/features/tasks/components/task-list";
import { requireCurrentUserContext } from "@/lib/auth/session";
import { getTaskPageData } from "@/services/task-service";
import { StatCard } from "@/components/dashboard/stat-card";
import { ListTodo, CheckCircle2, Clock, AlertCircle } from "lucide-react";

type TasksPageProps = {
  searchParams: Promise<{ search?: string }>;
};

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams;
  const search = params.search;
  
  const context = await requireCurrentUserContext();
  const { tasks, teams, companies, assignees, stats, error } =
    await getTaskPageData(50, search);

  const canChooseTeam = context.profile?.role === "admin";
  const canChooseAssignee = context.profile?.role !== "member";

  return (
    <section className="space-y-6 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          eyebrow="Task workspace"
          title={search ? `Results for "${search}"` : "Task Directory"}
          description={search ? `Found ${tasks.length} tasks matching your search.` : "Manage and track all client assignments in one place."}
        />
      </div>

      {error ? <AuthStatusMessage tone="info" message={error} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon={<ListTodo className="h-5 w-5" />}
          trend="Scope total"
          trendUp={true}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircle2 className="h-5 w-5 text-accent" />}
          trend="Total done"
          trendUp={true}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          trend="Active work"
          trendUp={true}
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          icon={<AlertCircle className="h-5 w-5 text-orange-500" />}
          trend="Needs attention"
          trendUp={false}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          <div className="rounded-[32px] border border-border bg-card shadow-sm overflow-hidden min-h-[600px]">
             <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
                <h3 className="font-bold tracking-tight">Active Work Items</h3>
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground whitespace-nowrap">Updated Just Now</span>
             </div>
             <div className="p-4">
               <TaskList tasks={tasks} />
             </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[32px] border border-border bg-card p-8 shadow-sm">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Quick create
              </p>
              <h2 className="text-2xl font-bold tracking-tight">
                Add Task
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Instantly add a new work item to this workspace.
              </p>
            </div>

            <div className="mt-8">
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
          </div>
          
          <div className="rounded-[32px] border border-border bg-accent/5 p-6 border-dashed">
             <p className="text-xs font-bold text-accent uppercase tracking-widest text-center">Tip: Use the board view for drag-and-drop workflow management.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
