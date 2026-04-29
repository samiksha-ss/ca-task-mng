import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { DeleteCompanyForm } from "@/features/companies/components/delete-company-form";
import { EditCompanyForm } from "@/features/companies/components/edit-company-form";
import { requireCurrentUserContext } from "@/lib/auth/session";
import { pageIdentities } from "@/lib/constants/page-identities";
import { COMPANIES_PATH } from "@/lib/constants/routes";
import {
  getCompanyDetailData,
  getCompanyPageData,
} from "@/services/company-service";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const identity = pageIdentities.companies;
  const IdentityIcon = identity.icon;
  const { companyId } = await params;
  const context = await requireCurrentUserContext();
  const { company, error } = await getCompanyDetailData(companyId);
  const directory = await getCompanyPageData();

  if (error) {
    return (
      <section className="space-y-6">
        <PageHeader
          eyebrow={identity.eyebrow}
          title="Company details"
          description="Open a client company to review relationship details and admin controls."
          icon={<IdentityIcon className="h-5 w-5" />}
          tone={identity.tone}
          compact
        />
        <AuthStatusMessage tone="info" message={error} />
      </section>
    );
  }

  if (!company) {
    notFound();
  }

  const canManage = context.profile?.role === "admin";

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={identity.eyebrow}
        title={company.name}
        description="Review client context, contact coverage, and admin management controls."
        icon={<IdentityIcon className="h-5 w-5" />}
        tone={identity.tone}
        backHref={COMPANIES_PATH}
        backLabel="Back to companies"
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]",
                company.status === "active"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {company.status}
            </span>
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-accent">
              {company.priority_tier}
            </span>
          </div>

          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-4">
              <dt className="text-muted-foreground">Industry</dt>
              <dd className="mt-1 font-medium">
                {company.industry ?? "Not added"}
              </dd>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <dt className="text-muted-foreground">Contact</dt>
              <dd className="mt-1 font-medium">
                {company.contact_name ?? "Not added"}
              </dd>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="mt-1 font-medium">
                {company.contact_email ?? "Not added"}
              </dd>
            </div>
          </dl>

          <div className="mt-6 rounded-2xl border border-border bg-background p-4">
            <p className="text-sm font-medium text-muted-foreground">Notes</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {company.notes ?? "No internal notes added yet."}
            </p>
          </div>
        </article>

        {canManage ? (
          <div className="space-y-6">
            <aside className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Company editor
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Update company
                </h2>
              </div>

              <div className="mt-6">
                <EditCompanyForm
                  companies={directory.companies}
                  initialCompanyId={company.id}
                />
              </div>
            </aside>

            <aside className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Danger zone
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Delete company
                </h2>
              </div>

              <div className="mt-4">
                <DeleteCompanyForm companyId={company.id} />
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </section>
  );
}
