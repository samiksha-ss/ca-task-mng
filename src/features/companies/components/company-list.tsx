import Link from "next/link";
import { getCompanyDetailPath } from "@/lib/constants/routes";
import type { Company } from "@/types";

type CompanyListProps = {
  companies: Company[];
};

export function CompanyList({ companies }: CompanyListProps) {
  if (companies.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-border bg-card p-8 text-sm text-muted-foreground shadow-sm">
        No companies are visible in this workspace yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {companies.map((company) => (
        <article
          key={company.id}
          className="rounded-[24px] border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
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

              <div>
                <h3 className="text-lg font-semibold">{company.name}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {company.notes ?? "No internal notes added yet."}
                </p>
              </div>
            </div>

            <dl className="grid min-w-[260px] gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <dt className="text-muted-foreground">Industry</dt>
                <dd className="mt-1 font-medium">
                  {company.industry ?? "Not added"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Contact</dt>
                <dd className="mt-1 font-medium">
                  {company.contact_name ?? "Not added"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="mt-1 font-medium">
                  {company.contact_email ?? "Not added"}
                </dd>
              </div>
            </dl>
          </div>

          <Link
            href={getCompanyDetailPath(company.id)}
            className="mt-4 inline-flex text-sm font-medium text-accent transition hover:opacity-80"
          >
            Open company details
          </Link>
        </article>
      ))}
    </div>
  );
}
