import type { ReactNode } from "react";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { AppTopbar } from "@/components/layout/app-topbar";
import { WorkspaceNav } from "@/components/navigation/workspace-nav";
import { getUserContext, requireCurrentUserContext } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { getNavigationForRole } from "@/lib/permissions/navigation";
import { getTeamDirectoryData } from "@/services/team-service";
import { getCompanyPageData } from "@/services/company-service";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const context = isSupabaseConfigured ? await requireCurrentUserContext() : null;
  const profile = context?.profile ?? null;
  const navigationItems = getNavigationForRole(profile?.role);

  const userContext = await getUserContext();
  // Fetch directory data for the creation modal in WorkspaceNav
  const [teamData, companyData] = await Promise.all([
    getTeamDirectoryData(userContext),
    getCompanyPageData(),
  ]);

  const directoryData = {
    teams: teamData.teams,
    companies: companyData.companies,
    assignees: teamData.members,
  };

  return (
    <div className="min-h-screen bg-background px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex min-h-[calc(100vh-2rem)] w-full gap-6">
        <WorkspaceNav 
          items={navigationItems} 
          userId={profile?.id ?? ""} 
          directoryData={directoryData} 
        />
        <main className="flex min-w-0 flex-1 flex-col gap-6">
          <AppTopbar context={context} />
          {context?.profileError ? (
            <AuthStatusMessage
              tone="info"
              message={`Profile bootstrap is pending. Run the latest Supabase migration, then sign in again. Details: ${context.profileError}`}
            />
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
