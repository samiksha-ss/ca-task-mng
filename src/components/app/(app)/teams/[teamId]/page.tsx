import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { toneMap } from "@/lib/ui/tone-map";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { MemberList } from "@/features/members/components/member-list";
import { TeamDeleteForm } from "@/features/teams/components/team-delete-form";
import { TeamEditForm } from "@/features/teams/components/team-edit-form";
import { requireCurrentUserContext } from "@/lib/auth/session";
import { pageIdentities } from "@/lib/constants/page-identities";
import { TEAMS_PATH } from "@/lib/constants/routes";
import { getTeamDetailData, getTeamDirectoryData } from "@/services/team-service";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const identity = pageIdentities.teams;
  const IdentityIcon = identity.icon;
  const { teamId } = await params;
  const context = await requireCurrentUserContext();
  const { team, members, error } = await getTeamDetailData(teamId);
  const directory = await getTeamDirectoryData();

  if (error) {
    return (
      <section className="space-y-6">
        <PageHeader
          eyebrow={identity.eyebrow}
          title="Team details"
          description="Open a team to review staffing and edit ownership details."
          icon={<IdentityIcon className="h-5 w-5" />}
          tone={toneMap[identity.tone]}
          compact
        />
        <AuthStatusMessage tone="info" message={error} />
      </section>
    );
  }

  if (!team) {
    notFound();
  }

  const canManage = context.profile?.role === "admin";

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={identity.eyebrow}
        title={team.name}
        description="Review staffing, manager ownership, and team-level edit controls."
        icon={<IdentityIcon className="h-5 w-5" />}
        tone={toneMap[identity.tone]}
        backHref={TEAMS_PATH}
        backLabel="Back to teams"
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">Team snapshot</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {team.description ?? "No team description added yet."}
          </p>

          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-4">
              <dt className="text-muted-foreground">Manager</dt>
              <dd className="mt-1 font-medium">
                {team.manager_name ?? "Not assigned"}
              </dd>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <dt className="text-muted-foreground">Manager email</dt>
              <dd className="mt-1 font-medium">
                {team.manager_email ?? "Not available"}
              </dd>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <dt className="text-muted-foreground">Visible members</dt>
              <dd className="mt-1 font-medium">{members.length}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <MemberList members={members} />
          </div>
        </article>

        {canManage ? (
          <div className="space-y-6">
            <aside className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Team editor
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Update team
                </h2>
              </div>

              <div className="mt-6">
                <TeamEditForm team={team} members={directory.members} />
              </div>
            </aside>

            <aside className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Danger zone
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Delete team
                </h2>
              </div>

              <div className="mt-4">
                <TeamDeleteForm teamId={team.id} />
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </section>
  );
}
