import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { toneMap } from "@/lib/ui/tone-map";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { CreateCompanyForm } from "@/features/companies/components/create-company-form";
import { EditCompanyForm } from "@/features/companies/components/edit-company-form";
import { CompanyList } from "@/features/companies/components/company-list";
import { requireCurrentUserContext } from "@/lib/auth/session";
import { pageIdentities } from "@/lib/constants/page-identities";
import { getCompanyPageData } from "@/services/company-service";

export default async function CompaniesPage() {
  const identity = pageIdentities.companies;
  const IdentityIcon = identity.icon;
  const context = await requireCurrentUserContext();
  const { companies, error } = await getCompanyPageData();
  const activeCompanies = companies.filter((company) => company.status === "active").length;
  const vipCompanies = companies.filter((company) => company.priority_tier === "vip").length;
  const canManageCompanies = context.profile?.role === "admin";

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={identity.eyebrow}
        title="Companies"
        description="Track client company context, relationship priority, and internal contact coverage in one shared workspace."
        icon={<IdentityIcon className="h-5 w-5" />}
        tone={toneMap[identity.tone]}
      />

      {error ? <AuthStatusMessage tone="info" message={error} /> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Visible companies"
          value={String(companies.length)}
          hint="Companies available in your current access scope"
        />
        <StatCard
          title="Active"
          value={String(activeCompanies)}
          hint="Client records currently marked active"
        />
        <StatCard
          title="VIP"
          value={String(vipCompanies)}
          hint="Highest-priority client relationships right now"
        />
      </div>

      {canManageCompanies ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <aside className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Company setup
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Create company
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Add a new client company before linking tasks and delivery work to it.
              </p>
            </div>

            <div className="mt-6">
              <CreateCompanyForm />
            </div>
          </aside>

          <aside className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Company controls
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Update company
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Adjust client status, priority tier, contact details, and internal notes.
              </p>
            </div>

            <div className="mt-6">
              <EditCompanyForm companies={companies} />
            </div>
          </aside>
        </div>
      ) : null}

      <CompanyList companies={companies} />
    </section>
  );
}
