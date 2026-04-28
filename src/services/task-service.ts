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

type TaskDirectoryData = {
  teams: Team[];
  companies: Company[];
  assignees: Profile[];
};

type TaskPageData = TaskDirectoryData & {
  tasks: Task[];
  stats: TaskStats;
  error: string | null;
};

type TaskDetailData = TaskDirectoryData & {
  task: Task | null;
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

type UpdateTaskInput = Omit<CreateTaskInput, "createdBy"> & {
  taskId: string;
};

const taskSelect = `
  *,
  companies:company_id(name),
  teams:team_id(name),
  assignee:assigned_to(full_name, email),
  creator:created_by(full_name, email)
`;

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
  const creator =
    task.creator && typeof task.creator === "object"
      ? (task.creator as Record<string, unknown>)
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
    team_name: team && typeof team.name === "string" ? team.name : null,
    assignee_name:
      assignee && typeof assignee.full_name === "string"
        ? assignee.full_name
        : typeof assignee?.email === "string"
          ? assignee.email
          : null,
    creator_name:
      creator && typeof creator.full_name === "string"
        ? creator.full_name
        : typeof creator?.email === "string"
          ? creator.email
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
      if (!task.due_date) {
        return false;
      }

      return task.due_date < today && task.status !== "done";
    }).length,
  };
}

async function getTaskDirectoryData(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<TaskDirectoryData> {
  const [teamsResponse, companiesResponse, assigneesResponse] = await Promise.all([
    supabase.from("teams").select("*").order("name"),
    supabase.from("companies").select("*").order("name"),
    supabase.from("profiles").select("*").order("full_name"),
  ]);

  return {
    teams: normalizeRows<Team>(teamsResponse.data),
    companies: normalizeRows<Company>(companiesResponse.data),
    assignees: normalizeRows<Profile>(assigneesResponse.data),
  };
}

export async function getTaskPageData(limit = 20): Promise<TaskPageData> {
  const supabase = await createSupabaseServerClient();

  const tasksResponse = await supabase
    .from("tasks")
    .select(taskSelect)
    .order("created_at", { ascending: false })
    .limit(limit);

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

  const directoryData = await getTaskDirectoryData(supabase);
  const tasks = Array.isArray(tasksResponse.data)
    ? tasksResponse.data
        .map((task) => normalizeTask(task))
        .filter((task): task is Task => task !== null)
    : [];

  return {
    ...directoryData,
    tasks,
    stats: calculateStats(tasks),
    error: tasksMissing
      ? "Run the latest Supabase task migration to enable the task module."
      : null,
  };
}

export async function getTaskDetailData(taskId: string): Promise<TaskDetailData> {
  const supabase = await createSupabaseServerClient();

  const taskResponse = await supabase
    .from("tasks")
    .select(taskSelect)
    .eq("id", taskId)
    .maybeSingle();

  const taskMissing =
    taskResponse.error?.code === "42P01" ||
    isMissingRelationError(taskResponse.error?.message);

  if (taskResponse.error && !taskMissing) {
    return {
      task: null,
      teams: [],
      companies: [],
      assignees: [],
      error: taskResponse.error.message,
    };
  }

  const directoryData = await getTaskDirectoryData(supabase);

  return {
    ...directoryData,
    task: normalizeTask(taskResponse.data),
    error: taskMissing
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

export async function updateTask(input: UpdateTaskInput) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("tasks")
    .update({
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
      completed_at: input.status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", input.taskId);

  return {
    error: error?.message ?? null,
  };
}

export async function deleteTask(taskId: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  return {
    error: error?.message ?? null,
  };
}
