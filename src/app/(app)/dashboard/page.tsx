import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { TaskListPreview } from "@/components/dashboard/task-list-preview";
import { ChartCard } from "@/components/dashboard/chart-card";
import { TeamActivityCard } from "@/components/dashboard/team-activity-card";
import { 
  getDashboardStats, 
  getRecentTasks, 
  getTasksDueSoon, 
  getTeamActivity,
  getTaskAnalytics
} from "@/lib/queries/dashboard";
import { CheckCircle2, Clock, AlertCircle, ListTodo, Plus, Building2, UserPlus, TrendingUp } from "lucide-react";
import Link from "next/link";
import { TASKS_PATH } from "@/lib/constants/routes";

export default async function DashboardPage() {
  // Fetch real data in parallel
  const [
    stats,
    recentTasks,
    dueSoonTasks,
    teamActivity,
    analytics
  ] = await Promise.all([
    getDashboardStats(),
    getRecentTasks(5),
    getTasksDueSoon(5),
    getTeamActivity(),
    getTaskAnalytics()
  ]);

  return (
    <section className="space-y-6 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Performance Overview</h2>
           <p className="text-muted-foreground mt-1">Real-time metrics for your CA workspace.</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold border border-green-500/20">
              <TrendingUp className="h-3.5 w-3.5" />
              Live System
           </span>
        </div>
      </div>

      {/* SECTION 1: KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon={<ListTodo className="h-5 w-5" />}
          trend={`${stats.total > 0 ? '+New' : 'No tasks'}`}
          trendUp={stats.total > 0}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          trend="Active work"
          trendUp={true}
        />
        <StatCard
          title="Due Soon"
          value={dueSoonTasks.length}
          icon={<AlertCircle className="h-5 w-5 text-orange-500" />}
          trend="Next 72h"
          trendUp={false}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircle2 className="h-5 w-5 text-accent" />}
          trend="Total delivery"
          trendUp={true}
        />
      </div>

      {/* SECTION 2: MAIN GRID */}
      <div className="grid gap-6 xl:grid-cols-[1fr_450px]">
        <DashboardCard 
          title="Task Analytics" 
          description="Workflow velocity and distribution."
          action={
            <Link href="/analytics" className="text-xs font-bold text-accent hover:underline uppercase tracking-widest">
              Full Report
            </Link>
          }
        >
          <ChartCard />
        </DashboardCard>
        
        <DashboardCard 
          title="Reminders & Upcoming" 
          description="Critical work items for this week."
        >
          <div className="mt-2">
            <TaskListPreview tasks={dueSoonTasks} />
          </div>
        </DashboardCard>
      </div>

      {/* SECTION 3 */}
      <div className="grid gap-6 xl:grid-cols-[450px_1fr]">
        <DashboardCard 
          title="Team Management" 
          description="Active collaboration across members."
          action={
             <button className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors group">
                <Plus className="h-4 w-4" />
             </button>
          }
        >
          <div className="mt-2">
            <TeamActivityCard members={teamActivity} />
          </div>
        </DashboardCard>

        <DashboardCard 
          title="Workload Distribution" 
          description="Task status percentage share."
        >
          <div className="flex flex-col sm:flex-row items-center justify-center p-4 flex-1">
             <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle cx="96" cy="96" r="75" stroke="currentColor" strokeWidth="22" fill="none" className="text-muted/40" />
                  {stats.total > 0 && (
                    <>
                      <circle 
                        cx="96" cy="96" r="75" stroke="currentColor" strokeWidth="22" fill="none" 
                        className="text-accent" 
                        strokeDasharray="471" 
                        strokeDashoffset={471 - (471 * (stats.completed / (stats.total || 1)))} 
                        strokeLinecap="round" 
                      />
                      <circle 
                        cx="96" cy="96" r="75" stroke="currentColor" strokeWidth="22" fill="none" 
                        className="text-amber-500" 
                        strokeDasharray="471" 
                        strokeDashoffset={471 - (471 * (stats.inProgress / (stats.total || 1)))} 
                        strokeLinecap="round"
                        style={{ transform: `rotate(${(stats.completed / stats.total) * 360}deg)`, transformOrigin: 'center' }}
                      />
                    </>
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-3xl font-bold tracking-tight">{stats.total}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Managed</p>
                </div>
             </div>
             
             <div className="sm:ml-12 mt-6 sm:mt-0 space-y-4 w-full">
                <div className="flex items-center justify-between group">
                   <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent"></div>
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Completed</span>
                   </div>
                   <span className="text-sm font-bold">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
                </div>
                <div className="flex items-center justify-between group">
                   <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">In Progress</span>
                   </div>
                   <span className="text-sm font-bold">{stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%</span>
                </div>
                <div className="flex items-center justify-between group">
                   <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40"></div>
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Remaining</span>
                   </div>
                   <span className="text-sm font-bold">{stats.total > 0 ? Math.round(((stats.total - stats.completed - stats.inProgress) / stats.total) * 100) : 0}%</span>
                </div>
                
                <div className="pt-4 mt-2 border-t border-border/60">
                   <p className="text-[10px] text-muted-foreground italic">Workload is calculated across all active client teams.</p>
                </div>
             </div>
          </div>
        </DashboardCard>
      </div>

      {/* SECTION 4 */}
      <div className="grid gap-6 xl:grid-cols-[1fr_350px]">
        <DashboardCard 
          title="Recent Activity" 
          description="The latest tasks logging into the system."
          action={
            <Link href={TASKS_PATH} className="text-xs font-bold text-accent hover:underline uppercase tracking-widest">
              View All
            </Link>
          }
        >
           <div className="mt-2">
             <TaskListPreview tasks={recentTasks} />
           </div>
        </DashboardCard>

        <DashboardCard title="System Actions">
          <div className="space-y-3 mt-2 flex-1">
             <button className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-300 font-bold text-sm flex items-center gap-3 active:scale-[0.98]">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-background border border-border shrink-0 shadow-sm">
                  <Plus className="w-5 h-5" />
                </div>
                New Work Item
             </button>
             <button className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-300 font-bold text-sm flex items-center gap-3 active:scale-[0.98]">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-background border border-border shrink-0 shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                Add Client Company
             </button>
             <button className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-300 font-bold text-sm flex items-center gap-3 active:scale-[0.98]">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-background border border-border shrink-0 shadow-sm">
                  <UserPlus className="w-5 h-5" />
                </div>
                Invite Team Member
             </button>
          </div>
          
          <div className="mt-6 p-4 rounded-2xl bg-muted/40 border border-border/60">
             <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">System Health</h4>
             <div className="mt-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium">Database Connected</span>
             </div>
          </div>
        </DashboardCard>
      </div>
    </section>
  );
}
