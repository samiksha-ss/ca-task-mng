import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Company,
  Profile,
  Task,
  TaskPriority,
  TaskStats,
  TaskStatus,
  Team,
} from "@/types";

type TaskPageData = {
  tasks: Task[];
  teams: Team[];
  companies: Company[];
  assignees: Profile[];
  stats: TaskStats;
  error: string | null;
};

type CreateTaskInput = {
  title: string;
  description?: string;
  companyId?: string | null;
  teamId?: string | null;
  assignedTo?: string | null;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedMinutes: number;
  billable: boolean;
  createdBy: string;
};

function isMissingRelationError(message: string | undefined) {
  return (
    message?.includes("does not exist") ||
    message?.includes("Could not find the table") ||
    message?.includes("relation") ||
    false
  );
}

function normalizeTask(data: unknown): Task | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const task = data as Record<string, unknown>;

  if (
    typeof task.id !== "string" ||
    typeof task.title !== "string" ||
    typeof task.created_by !== "string"
  ) {
    return null;
  }

  const company =
    task.companies && typeof task.companies === "object"
      ? (task.companies as Record<string, unknown>)
      : null;
  const team =
    task.teams && typeof task.teams === "object"
      ? (task.teams as Record<string, unknown>)
      : null;
  const assignee =
    task.assignee && typeof task.assignee === "object"
      ? (task.assignee as Record<string, unknown>)
      : null;

  return {
    id: task.id,
    title: task.title,
    description: typeof task.description === "string" ? task.description : null,
    company_id: typeof task.company_id === "string" ? task.company_id : null,
    team_id: typeof task.team_id === "string" ? task.team_id : null,
    assigned_to: typeof task.assigned_to === "string" ? task.assigned_to : null,
    created_by: task.created_by,
    status:
      task.status === "backlog" ||
      task.status === "todo" ||
      task.status === "in_progress" ||
      task.status === "in_review" ||
      task.status === "done" ||
      task.status === "blocked"
        ? task.status
        : "todo",
    priority:
      task.priority === "low" ||
      task.priority === "medium" ||
      task.priority === "high" ||
      task.priority === "urgent"
        ? task.priority
        : "medium",
    start_date: typeof task.start_date === "string" ? task.start_date : null,
    due_date: typeof task.due_date === "string" ? task.due_date : null,
    completed_at:
      typeof task.completed_at === "string" ? task.completed_at : null,
    estimated_minutes:
      typeof task.estimated_minutes === "number" ? task.estimated_minutes : 0,
    actual_minutes:
      typeof task.actual_minutes === "number" ? task.actual_minutes : 0,
    billable: typeof task.billable === "boolean" ? task.billable : false,
    sort_order: typeof task.sort_order === "number" ? task.sort_order : 0,
    created_at: typeof task.created_at === "string" ? task.created_at : "",
    updated_at: typeof task.updated_at === "string" ? task.updated_at : "",
    company_name:
      company && typeof company.name === "string" ? company.name : null,
    team_name:
      team && typeof team.name === "string" ? team.name : null,
    assignee_name:
      assignee && typeof assignee.full_name === "string"
        ? assignee.full_name
        : null,
  };
}

function normalizeRows<T extends { id: string }>(data: unknown): T[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(
    (row): row is T =>
      Boolean(row) && typeof row === "object" && typeof row.id === "string",
  );
}

function calculateStats(tasks: Task[]): TaskStats {
  const today = new Date().toISOString().slice(0, 10);

  return {
    total: tasks.length,
    completed: tasks.filter((task) => task.status === "done").length,
    inProgress: tasks.filter((task) =>
      ["in_progress", "in_review"].includes(task.status),
    ).length,
    overdue: tasks.filter((task) => {
      const dueDate = task.due_date;

      if (!dueDate) {
        return false;
      }

      return dueDate < today && task.status !== "done";
    }).length,
  };
}

export async function getTaskPageData(): Promise<TaskPageData> {
  const supabase = await createSupabaseServerClient();

  const tasksResponse = await supabase
    .from("tasks")
    .select(
      `
        *,
        companies:company_id(name),
        teams:team_id(name),
        assignee:assigned_to(full_name)
      `,
    )
    .order("created_at", { ascending: false })
    .limit(20);

  const tasksMissing =
    tasksResponse.error?.code === "42P01" ||
    isMissingRelationError(tasksResponse.error?.message);

  if (tasksResponse.error && !tasksMissing) {
    return {
      tasks: [],
      teams: [],
      companies: [],
      assignees: [],
      stats: { total: 0, completed: 0, inProgress: 0, overdue: 0 },
      error: tasksResponse.error.message,
    };
  }

  const [teamsResponse, companiesResponse, assigneesResponse] = await Promise.all([
    supabase.from("teams").select("*").order("name"),
    supabase.from("companies").select("*").order("name"),
    supabase.from("profiles").select("*").order("full_name"),
  ]);

  const tasks = Array.isArray(tasksResponse.data)
    ? tasksResponse.data
        .map((task) => normalizeTask(task))
        .filter((task): task is Task => task !== null)
    : [];

  return {
    tasks,
    teams: normalizeRows<Team>(teamsResponse.data),
    companies: normalizeRows<Company>(companiesResponse.data),
    assignees: normalizeRows<Profile>(assigneesResponse.data),
    stats: calculateStats(tasks),
    error: tasksMissing
      ? "Run the latest Supabase task migration to enable the task module."
      : null,
  };
}

export async function createTask(input: CreateTaskInput) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("tasks").insert({
    title: input.title,
    description: input.description || null,
    company_id: input.companyId || null,
    team_id: input.teamId || null,
    assigned_to: input.assignedTo || null,
    due_date: input.dueDate || null,
    priority: input.priority,
    status: input.status,
    estimated_minutes: input.estimatedMinutes,
    billable: input.billable,
    created_by: input.createdBy,
  });

  return {
    error: error?.message ?? null,
  };
}
