import type { CurrentUserContext } from "@/types/auth";
import type { Company, Task } from "@/types";
import { getCompanyPageData } from "./company-service";
import { getTaskPageData } from "./task-service";
import { getTeamDirectoryData } from "./team-service";

export type DashboardMetric = {
  label: string;
  value: string;
  hint: string;
};

export type DashboardPageData = {
  metrics: DashboardMetric[];
  recentTasks: Task[];
  dueSoonTasks: Task[];
  overdueTasks: Task[];
  companies: Company[];
  summaryTitle: string;
  summaryBody: string;
  scopeLabel: string;
  error: string | null;
};

function getTodayDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDatePlusDays(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function buildRoleSummary(context: CurrentUserContext, counts: {
  teams: number;
  members: number;
  companies: number;
  visibleTasks: number;
}) {
  const profile = context.profile;

  if (!profile) {
    return {
      summaryTitle: "Workspace access is active",
      summaryBody:
        "Your session is valid, but the profile record is not fully available yet.",
      scopeLabel: "Signed-in session",
    };
  }

  if (profile.role === "admin") {
    return {
      summaryTitle: "Company-wide delivery visibility",
      summaryBody: `You can currently review ${counts.visibleTasks} tasks, ${counts.companies} companies, ${counts.teams} teams, and ${counts.members} member profiles across the workspace.`,
      scopeLabel: "Admin scope",
    };
  }

  if (profile.role === "manager") {
    return {
      summaryTitle: "Team delivery command center",
      summaryBody: `You can currently review ${counts.visibleTasks} scoped tasks and ${counts.members} visible member profiles for your management area.`,
      scopeLabel: profile.team_id ? "Manager team scope" : "Manager scope",
    };
  }

  return {
    summaryTitle: "Personal execution workspace",
    summaryBody: `You can currently review ${counts.visibleTasks} tasks available to your member scope and stay ahead of upcoming due dates.`,
    scopeLabel: "Member scope",
  };
}

export async function getDashboardPageData(
  context: CurrentUserContext,
): Promise<DashboardPageData> {
  const [taskData, teamData, companyData] = await Promise.all([
    getTaskPageData(200),
    getTeamDirectoryData(),
    getCompanyPageData(),
  ]);

  const today = getTodayDateKey();
  const weekAhead = getDatePlusDays(7);
  const visibleTasks = taskData.tasks;
  const recentTasks = [...visibleTasks].slice(0, 8);
  const dueSoonTasks = visibleTasks
    .filter((task) => {
      if (!task.due_date || task.status === "done") {
        return false;
      }

      return task.due_date >= today && task.due_date <= weekAhead;
    })
    .sort((left, right) => (left.due_date ?? "").localeCompare(right.due_date ?? ""))
    .slice(0, 6);
  const overdueTasks = visibleTasks
    .filter((task) => Boolean(task.due_date) && task.due_date! < today && task.status !== "done")
    .sort((left, right) => (left.due_date ?? "").localeCompare(right.due_date ?? ""))
    .slice(0, 6);

  const assignedToMe = visibleTasks.filter(
    (task) => task.assigned_to === context.user.id,
  ).length;
  const completedTasks = visibleTasks.filter((task) => task.status === "done").length;
  const activeCompanies = companyData.companies.filter(
    (company) => company.status === "active",
  ).length;
  const activeMembers = teamData.members.filter((member) => member.is_active).length;
  const counts = {
    teams: teamData.teams.length,
    members: teamData.members.length,
    companies: companyData.companies.length,
    visibleTasks: visibleTasks.length,
  };
  const summary = buildRoleSummary(context, counts);

  const metrics: DashboardMetric[] =
    context.profile?.role === "member"
      ? [
          {
            label: "Assigned to you",
            value: String(assignedToMe),
            hint: "Visible tasks currently assigned to your user",
          },
          {
            label: "In progress",
            value: String(taskData.stats.inProgress),
            hint: "Open work currently in execution or review",
          },
          {
            label: "Due this week",
            value: String(dueSoonTasks.length),
            hint: "Upcoming task deadlines inside the next 7 days",
          },
          {
            label: "Overdue",
            value: String(taskData.stats.overdue),
            hint: "Open tasks already past their due date",
          },
        ]
      : [
          {
            label: "Visible tasks",
            value: String(taskData.stats.total),
            hint: "Tasks available under your current access scope",
          },
          {
            label: "Completed",
            value: String(completedTasks),
            hint: "Visible tasks already marked done",
          },
          {
            label: "Active companies",
            value: String(activeCompanies),
            hint: "Client companies currently marked active",
          },
          {
            label: "Active members",
            value: String(activeMembers),
            hint: "Visible workspace members currently marked active",
          },
        ];

  return {
    metrics,
    recentTasks,
    dueSoonTasks,
    overdueTasks,
    companies: companyData.companies.slice(0, 6),
    summaryTitle: summary.summaryTitle,
    summaryBody: summary.summaryBody,
    scopeLabel: summary.scopeLabel,
    error: taskData.error ?? teamData.error ?? companyData.error,
  };
}
