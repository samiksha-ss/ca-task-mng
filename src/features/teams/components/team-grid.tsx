import type { TeamSummary } from "@/services/team-service";

type TeamGridProps = {
  teams: TeamSummary[];
};

export function TeamGrid({ teams }: TeamGridProps) {
  if (teams.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-border bg-card p-8 text-sm text-muted-foreground shadow-sm">
        No teams are visible in your current workspace scope yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {teams.map((team) => (
        <article
          key={team.id}
          className="rounded-[28px] border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{team.name}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {team.description ?? "No team description added yet."}
              </p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {team.member_count} members
            </span>
          </div>

          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-[22px] border border-border bg-background p-4">
              <dt className="text-muted-foreground">Manager</dt>
              <dd className="mt-1 font-medium">
                {team.manager_name ?? "Not assigned"}
              </dd>
            </div>
            <div className="rounded-[22px] border border-border bg-background p-4">
              <dt className="text-muted-foreground">Manager email</dt>
              <dd className="mt-1 font-medium">
                {team.manager_email ?? "Not available"}
              </dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}
