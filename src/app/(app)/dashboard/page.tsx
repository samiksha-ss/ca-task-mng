import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { requireCurrentUserContext } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/constants/app";
import { TASKS_PATH } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { getTaskPageData } from "@/services/task-service";

export default async function DashboardPage() {
  const context = isSupabaseConfigured ? await requireCurrentUserContext() : null;
  const user = context?.user ?? null;
  const profile = context?.profile ?? null;
  const taskData = context ? await getTaskPageData() : null;

  const roleSummary = {
    admin: "You have company-wide visibility and control across teams, users, and tasks.",
    manager:
      "You are scoped to team management, assignment, and delivery visibility for your team.",
    member:
      "You can focus on your own task execution, deadlines, and personal progress tracking.",
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description={
          profile
            ? roleSummary[profile.role]
            : "Your role-aware workspace is ready. Apply the migrations and sign in to hydrate the full context."
        }
        action={
          <Link
            href={TASKS_PATH}
            className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground"
          >
            Open task module
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Role"
          value={profile ? ROLE_LABELS[profile.role] : "Pending"}
          hint="This determines navigation and access scope."
        />
        <StatCard
          label="Visible tasks"
          value={String(taskData?.stats.total ?? 0)}
          hint="Based on the first task RLS policies and current session."
        />
        <StatCard
          label="Active work"
          value={String(taskData?.stats.inProgress ?? 0)}
          hint="Tasks currently in execution or review."
        />
        <StatCard
          label="Overdue"
          value={String(taskData?.stats.overdue ?? 0)}
          hint="Open work that needs immediate attention."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-border bg-card p-8 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            Workspace progression
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            The app now has a real shell and a live task foundation
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            Authentication, profile bootstrap, role-aware navigation, and the
            first task CRUD flow are all in place. The next iteration can focus
            on richer task operations, board/calendar views, and team management.
          </p>
        </div>

        <div className="rounded-[28px] border border-border bg-card p-8 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Session</p>
          <h3 className="mt-2 text-xl font-semibold">Current user context</h3>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="mt-1 font-medium">
                {profile?.full_name ?? "Profile not bootstrapped yet"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="mt-1 font-medium">
                {profile?.email ?? user?.email ?? "Supabase not configured"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Role</dt>
              <dd className="mt-1 font-medium capitalize">
                {profile?.role ?? "member"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Team ID</dt>
              <dd className="mt-1 break-all font-medium">
                {profile?.team_id ?? "No team assigned yet"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">User ID</dt>
              <dd className="mt-1 break-all font-medium">
                {user?.id ?? "No active session"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
