export type TaskStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "in_review"
  | "done"
  | "blocked";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  company_id: string | null;
  team_id: string | null;
  assigned_to: string | null;
  created_by: string;
  status: TaskStatus;
  priority: TaskPriority;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  estimated_minutes: number;
  actual_minutes: number;
  billable: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  company_name?: string | null;
  team_name?: string | null;
  assignee_name?: string | null;
  creator_name?: string | null;
};

export type TaskStats = {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
};
