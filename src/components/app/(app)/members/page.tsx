import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { toneMap } from "@/lib/ui/tone-map";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { MemberList } from "@/features/members/components/member-list";
import { pageIdentities } from "@/lib/constants/page-identities";
import { getTeamDirectoryData } from "@/services/team-service";

export default async function MembersPage() {
  const identity = pageIdentities.members;
  const IdentityIcon = identity.icon;
  const { members, error } = await getTeamDirectoryData();
  const activeMembers = members.filter((member) => member.is_active).length;
  const managers = members.filter((member) => member.role === "manager").length;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={identity.eyebrow}
        title="Members"
        description="Browse the visible member directory, team assignments, and current role distribution."
        icon={<IdentityIcon className="h-5 w-5" />}
        tone={toneMap[identity.tone]}
      />

      {error ? <AuthStatusMessage tone="info" message={error} /> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Visible members"
          value={String(members.length)}
          hint="Profiles currently visible to your role"
        />
        <StatCard
          title="Active members"
          value={String(activeMembers)}
          hint="Profiles marked active in the current scope"
        />
        <StatCard
          title="Managers"
          value={String(managers)}
          hint="Visible users currently holding a manager role"
        />
      </div>

      <MemberList members={members} />
    </section>
  );
}
