import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { MemberManagementForm } from "@/features/members/components/member-management-form";
import { requireCurrentUserContext } from "@/lib/auth/session";
import { pageIdentities } from "@/lib/constants/page-identities";
import { MEMBERS_PATH } from "@/lib/constants/routes";
import { getMemberDetailData, getTeamDirectoryData } from "@/services/team-service";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const identity = pageIdentities.members;
  const IdentityIcon = identity.icon;
  const { memberId } = await params;
  const context = await requireCurrentUserContext();
  const { member, teams, error } = await getMemberDetailData(memberId);
  const directory = await getTeamDirectoryData();

  if (error) {
    return (
      <section className="space-y-6">
        <PageHeader
          eyebrow={identity.eyebrow}
          title="Member details"
          description="Open a member profile to review assignment and role information."
          icon={<IdentityIcon className="h-5 w-5" />}
          tone={identity.tone}
          compact
        />
        <AuthStatusMessage tone="info" message={error} />
      </section>
    );
  }

  if (!member) {
    notFound();
  }

  const canManage = context.profile?.role === "admin";

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={identity.eyebrow}
        title={member.full_name ?? member.email}
        description="Review team assignment, role, and admin management controls for this member."
        icon={<IdentityIcon className="h-5 w-5" />}
        tone={identity.tone}
        backHref={MEMBERS_PATH}
        backLabel="Back to members"
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-accent">
              {member.role}
            </span>
            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]",
                member.is_active
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {member.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="mt-1 font-medium">{member.email}</dd>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <dt className="text-muted-foreground">Team</dt>
              <dd className="mt-1 font-medium">
                {member.team_name ?? "Unassigned"}
              </dd>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <dt className="text-muted-foreground">Job title</dt>
              <dd className="mt-1 font-medium">
                {member.job_title ?? "Not added"}
              </dd>
            </div>
          </dl>
        </article>

        {canManage ? (
          <aside className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Member editor
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Update member
              </h2>
            </div>

            <div className="mt-6">
              <MemberManagementForm
                members={directory.members}
                teams={teams}
                initialMemberId={member.id}
                defaultRole={member.role}
                defaultTeamId={member.team_id}
                defaultJobTitle={member.job_title}
                defaultIsActive={member.is_active}
              />
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
