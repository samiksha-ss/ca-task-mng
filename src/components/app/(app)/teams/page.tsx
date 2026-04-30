import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { toneMap } from "@/lib/ui/tone-map";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { TeamGrid } from "@/features/teams/components/team-grid";
import { pageIdentities } from "@/lib/constants/page-identities";
import { getTeamDirectoryData } from "@/services/team-service";

export default async function TeamsPage() {
  const identity = pageIdentities.teams;
  const IdentityIcon = identity.icon;
  const { teams, members, error } = await getTeamDirectoryData();
  const staffedTeams = teams.filter((team) => team.member_count > 0).length;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={identity.eyebrow}
        title="Teams"
        description="Review ownership boundaries, manager coverage, and which teams already have active staffing."
        icon={<IdentityIcon className="h-5 w-5" />}
        tone={toneMap[identity.tone]}
      />

      {error ? <AuthStatusMessage tone="info" message={error} /> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Visible teams"
          value={String(teams.length)}
          hint="Teams available within your current role scope"
        />
        <StatCard
          title="Staffed teams"
          value={String(staffedTeams)}
          hint="Teams with at least one visible member assigned"
        />
        <StatCard
          title="Visible members"
          value={String(members.length)}
          hint="People contributing across the teams you can access"
        />
      </div>

      <TeamGrid teams={teams} />
    </section>
  );
}
