import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { EditCompanyForm } from "@/features/companies/components/edit-company-form";
import { DeleteCompanyForm } from "@/features/companies/components/delete-company-form";
import { getCompanyDetailData } from "@/services/company-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/auth/session";
import { Building2, ArrowLeft, Mail, User, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { COMPANIES_PATH } from "@/lib/constants/routes";

type CompanyDetailPageProps = {
  params: Promise<{
    companyId: string;
  }>;
};

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { companyId } = await params;
  const userContext = await getUserContext();
  const { company, error } = await getCompanyDetailData(companyId);

  if (error) {
    return (
      <div className="p-6">
        <AuthStatusMessage tone="error" message={error} />
      </div>
    );
  }

  if (!company) {
    notFound();
  }

  const isAdmin = userContext.role === "admin";

  // Fetch tasks associated with this company
  const supabase = await createSupabaseServerClient();
  const { data: relatedTasks } = await supabase
    .from("tasks")
    .select("*, assignee:assigned_to(full_name, email)")
    .eq("company_id", companyId)
    .order("due_date", { ascending: true });

  const tasks = relatedTasks || [];
  const openTasks = tasks.filter((t) => t.status !== "done");

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={COMPANIES_PATH}
          className="h-10 w-10 rounded-full border border-border bg-background flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <span className="text-sm font-semibold text-muted-foreground">Back to Companies</span>
      </div>

      <PageHeader
        eyebrow="Company Profile"
        title={company.name}
        description={company.industry ? `Industry: ${company.industry}` : "No industry specified"}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details and Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Details */}
          <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <h2 className="text-xl font-bold tracking-tight">Company Context</h2>
              <div className="flex gap-2">
                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest",
                    company.status === "active"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {company.status}
                </span>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent">
                  {company.priority_tier}
                </span>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-background/50">
                <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Primary Contact</h4>
                  <p className="mt-1 font-semibold text-sm">{company.contact_name ?? "None added"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-background/50">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Email</h4>
                  <p className="mt-1 font-semibold text-sm">{company.contact_email ?? "None added"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Internal Notes & Context</h4>
              <div className="p-4 rounded-2xl border border-border bg-background/30 text-sm leading-relaxed text-muted-foreground">
                {company.notes ?? "No internal notes or accounting directions added yet."}
              </div>
            </div>
          </div>

          {/* Related Tasks */}
          <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <h2 className="text-xl font-bold tracking-tight">Accounting Tasks</h2>
              <span className="text-xs font-bold bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                {openTasks.length} active tasks
              </span>
            </div>

            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4">No tasks are currently associated with this client.</p>
            ) : (
              <div className="divide-y divide-border/60">
                {tasks.map((task) => (
                  <div key={task.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold hover:text-accent transition-colors">
                        <Link href={`/tasks/${task.id}`}>{task.title}</Link>
                      </h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>Assigned to: {task.assignee?.full_name ?? task.assignee?.email ?? "Unassigned"}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
                        </span>
                      </p>
                    </div>
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                        task.status === "done"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-amber-500/10 text-amber-600",
                      ].join(" ")}
                    >
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          {isAdmin ? (
            <>
              <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-bold tracking-tight mb-4">Edit Company Context</h2>
                <EditCompanyForm companies={[company]} initialCompanyId={company.id} />
              </div>

              <div className="rounded-[28px] border border-red-500/20 bg-card p-6 shadow-sm">
                <h2 className="text-lg font-bold text-red-500 tracking-tight mb-2 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" /> Danger Zone
                </h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Deleting this company is permanent. This clears client metadata and unlinks any related workspace tasks.
                </p>
                <DeleteCompanyForm companyId={company.id} />
              </div>
            </>
          ) : (
            <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm h-fit">
              <h2 className="text-lg font-bold tracking-tight mb-2">Role Access</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You have read-only access to this company record. Any modifications, client context editing, or client removal require administrative elevation.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
