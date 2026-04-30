import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { MemberManagementForm } from "@/features/members/components/member-management-form";
import { MemberList } from "@/features/members/components/member-list";
import { AssignManagerForm } from "@/features/teams/components/assign-manager-form";
import { CreateTeamForm } from "@/features/teams/components/create-team-form";
import { TeamGrid } from "@/features/teams/components/team-grid";
import { getTeamDirectoryData } from "@/services/team-service";

import { getUserContext } from "@/lib/auth/session";

export default async function AdminUsersPage() {
  const userContext = await getUserContext();
  const { teams, members, error } = await getTeamDirectoryData(userContext);
  const admins = members.filter((member) => member.role === "admin").length;
  const unassignedMembers = members.filter((member) => !member.team_id).length;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Admin tools"
        title="User management"
        description="Review company-wide people and team visibility before deeper onboarding, role-change, and assignment workflows are added."
      />

      {error ? <AuthStatusMessage tone="info" message={error} /> : null}

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total users"
          value={String(members.length)}
          hint="Profiles currently available to the admin role"
        />
        <StatCard
          title="Admins"
          value={String(admins)}
          hint="Users with company-wide access rights"
        />
        <StatCard
          title="Teams"
          value={String(teams.length)}
          hint="Internal teams currently configured"
        />
        <StatCard
          title="Unassigned"
          value={String(unassignedMembers)}
          hint="Members not yet linked to a team"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <aside className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Team setup
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">Create team</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Add a new internal delivery team before assigning work and ownership.
            </p>
          </div>

          <div className="mt-6">
            <CreateTeamForm />
          </div>
        </aside>

        <aside className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Ownership
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Assign manager
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Link a team to an admin or manager profile that should own delivery.
            </p>
          </div>

          <div className="mt-6">
            <AssignManagerForm teams={teams} members={members} />
          </div>
        </aside>

        <aside className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Member controls
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Update member
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Adjust a member&apos;s role, team assignment, job title, and active state.
            </p>
          </div>

          <div className="mt-6">
            <MemberManagementForm members={members} teams={teams} />
          </div>
        </aside>
      </div>

      <TeamGrid teams={teams} />
      <MemberList members={members} />
    </section>
  );
}
