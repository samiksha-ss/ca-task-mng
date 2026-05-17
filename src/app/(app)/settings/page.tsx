import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "@/components/settings/settings-form";
import { requireCurrentUserContext } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function SettingsPage() {
  const context = await requireCurrentUserContext();
  const supabase = await createSupabaseServerClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      *,
      team:team_id(name)
    `)
    .eq("id", context.user.id)
    .maybeSingle();

  if (error || !profile) {
    notFound();
  }

  const profileWithEmail = {
    id: profile.id,
    full_name: profile.full_name,
    email: context.user.email || "",
    role: profile.role,
    job_title: profile.job_title,
    team_name: profile.team?.name || null,
    is_active: profile.is_active,
  };

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Configuration"
        title="Workspace Settings"
        description="Manage your profile metadata, secure your user account, and configure workspace digests."
      />

      <SettingsForm profile={profileWithEmail} />
    </section>
  );
}
