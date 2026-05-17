import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { CompanyList } from "@/features/companies/components/company-list";
import { CreateCompanyForm } from "@/features/companies/components/create-company-form";
import { EditCompanyForm } from "@/features/companies/components/edit-company-form";
import { getCompanyPageData } from "@/services/company-service";
import { getUserContext } from "@/lib/auth/session";

export default async function CompaniesPage() {
  const userContext = await getUserContext();
  const { companies, error } = await getCompanyPageData();
  
  const isAdmin = userContext.role === "admin";
  const activeCount = companies.filter((c) => c.status === "active").length;
  const vipCount = companies.filter((c) => c.priority_tier === "vip").length;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Client records"
        title="Companies"
        description="Manage client company contexts, contact information, industry details, and priority tiers for accounting assignments."
      />

      {error ? <AuthStatusMessage tone="info" message={error} /> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total companies"
          value={String(companies.length)}
          hint="Client records in current database"
        />
        <StatCard
          title="Active clients"
          value={String(activeCount)}
          hint="Client companies marked as active"
        />
        <StatCard
          title="VIP clients"
          value={String(vipCount)}
          hint="Priority client records marked as VIP"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Companies List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold tracking-tight mb-4">All Companies</h2>
            <CompanyList companies={companies} />
          </div>
        </div>

        {/* Right Column - Admin Panel */}
        {isAdmin ? (
          <div className="space-y-6">
            {/* Create Company Form */}
            <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-bold tracking-tight mb-4">Create New Company</h2>
              <CreateCompanyForm />
            </div>

            {/* Edit Company Form */}
            {companies.length > 0 ? (
              <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-bold tracking-tight mb-4">Edit / Manage Company</h2>
                <EditCompanyForm companies={companies} />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm h-fit">
            <h2 className="text-lg font-bold tracking-tight mb-2">Workspace Info</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Company editing, creation, and deletion are restricted to Administrator roles. Managers and members have read-only access to client company context.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
