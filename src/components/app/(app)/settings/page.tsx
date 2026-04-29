import { PageHeader } from "@/components/layout/page-header";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { ProfileSettingsForm } from "@/features/settings/components/profile-settings-form";
import { requireCurrentUserContext } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/constants/app";
import { pageIdentities } from "@/lib/constants/page-identities";
import { getSettingsPageData } from "@/services/profile-service";

export default async function SettingsPage() {
  const identity = pageIdentities.settings;
  const IdentityIcon = identity.icon;
  const context = await requireCurrentUserContext();
  const { teams, error } = await getSettingsPageData();
  const profile = context.profile;
  const teamName = teams.find((team) => team.id === profile?.team_id)?.name ?? null;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={identity.eyebrow}
        title="Settings"
        description="Manage your personal profile details and review the current access context for this workspace account."
        icon={<IdentityIcon className="h-5 w-5" />}
        tone={identity.tone}
      />

      {error ? <AuthStatusMessage tone="info" message={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Profile settings
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Personal details
            </h2>
          </div>

          <div className="mt-6">
            <ProfileSettingsForm profile={profile} />
          </div>
        </article>

        <article className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Access context
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Workspace account
            </h2>
          </div>

          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-[22px] border border-border bg-background p-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="mt-1 font-medium">{profile?.email ?? context.user.email}</dd>
            </div>
            <div className="rounded-[22px] border border-border bg-background p-4">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="mt-1 font-medium">
                {profile ? ROLE_LABELS[profile.role] : "Unassigned"}
              </dd>
            </div>
            <div className="rounded-[22px] border border-border bg-background p-4">
              <dt className="text-muted-foreground">Team</dt>
              <dd className="mt-1 font-medium">
                {teamName ?? "No team assigned"}
              </dd>
            </div>
            <div className="rounded-[22px] border border-border bg-background p-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="mt-1 font-medium">
                {profile?.is_active ? "Active" : "Inactive"}
              </dd>
            </div>
          </dl>

          <div className="mt-6 rounded-[22px] border border-border bg-background p-4">
            <p className="text-sm font-medium text-muted-foreground">
              Account identifiers
            </p>
            <p className="mt-2 break-all text-sm text-muted-foreground">
              User ID: {context.user.id}
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
