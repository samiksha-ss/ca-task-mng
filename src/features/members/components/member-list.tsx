import type { MemberSummary } from "@/services/team-service";

type MemberListProps = {
  members: MemberSummary[];
};

export function MemberList({ members }: MemberListProps) {
  if (members.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-border bg-card p-8 text-sm text-muted-foreground shadow-sm">
        No members are visible in your current workspace scope yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <article
          key={member.id}
          className="rounded-[24px] border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
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
              <div>
                <h3 className="text-lg font-semibold">
                  {member.full_name ?? member.email}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{member.email}</p>
              </div>
            </div>

            <dl className="grid min-w-[260px] gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <dt className="text-muted-foreground">Team</dt>
                <dd className="mt-1 font-medium">
                  {member.team_name ?? "Unassigned"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Job title</dt>
                <dd className="mt-1 font-medium">
                  {member.job_title ?? "Not added"}
                </dd>
              </div>
            </dl>
          </div>
        </article>
      ))}
    </div>
  );
}
