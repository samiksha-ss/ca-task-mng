import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Task, TaskStats } from "@/types";

/**
 * Fetches dashboard statistics based on real task data.
 */
export async function getDashboardStats(): Promise<TaskStats> {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("status, due_date");

  if (error || !tasks) {
    return { total: 0, completed: 0, inProgress: 0, overdue: 0 };
  }

  return {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "done").length,
    inProgress: tasks.filter((t) => ["in_progress", "in_review"].includes(t.status)).length,
    overdue: tasks.filter((t) => t.status !== "done" && t.due_date && t.due_date < today).length,
  };
}

/**
 * Fetches the most recently created tasks.
 */
export async function getRecentTasks(limit = 5): Promise<Task[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      companies:company_id(name),
      assignee:assigned_to(full_name, email)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  
  return data.map(task => ({
    ...task,
    company_name: task.companies?.name,
    assignee_name: task.assignee?.full_name || task.assignee?.email
  }));
}

/**
 * Fetches tasks due today or upcoming within 3 days.
 */
export async function getTasksDueSoon(limit = 10): Promise<Task[]> {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().split("T")[0];
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      companies:company_id(name)
    `)
    .neq("status", "done")
    .gte("due_date", today)
    .lte("due_date", threeDaysFromNow)
    .order("due_date", { ascending: true })
    .limit(limit);

  if (error || !data) return [];

  return data.map(task => ({
    ...task,
    company_name: task.companies?.name
  }));
}

/**
 * Fetches team activity (profiles and counts of their assigned tasks).
 */
export async function getTeamActivity() {
  const supabase = await createSupabaseServerClient();
  
  // This is a simplified version of "activity"
  // We fetch profiles and count their tasks
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      avatar_url,
      role,
      tasks:tasks(id, status)
    `)
    .limit(10);

  if (error || !data) return [];

  return data.map(profile => ({
    id: profile.id,
    name: profile.full_name || profile.email,
    avatar: profile.full_name ? profile.full_name.split(' ').map(n => n[0]).join('') : 'U',
    role: profile.role,
    tasksCompleted: profile.tasks?.filter((t: any) => t.status === 'done').length || 0,
    activeTasks: profile.tasks?.filter((t: any) => t.status !== 'done').length || 0
  }));
}

/**
 * Fetches aggregated task data for charts (e.g., tasks completed by date or by status).
 */
export async function getTaskAnalytics() {
  const supabase = await createSupabaseServerClient();
  
  const { data: statusCounts, error } = await supabase
    .from("tasks")
    .select("status");

  if (error || !statusCounts) return { statusDistribution: [] };

  const counts = statusCounts.reduce((acc: Record<string, number>, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  return {
    statusDistribution: Object.entries(counts).map(([name, value]) => ({ name, value }))
  };
}
