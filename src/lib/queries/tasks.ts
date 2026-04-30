import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Task, TaskStatus } from "@/types";

export type UserContext = {
  id: string;
  role: string;
  team_id: string | null;
};

/**
 * Applies role-based filters to a Supabase query for the tasks table.
 */
export function applyRoleFilters(query: any, userContext: UserContext) {
  if (userContext.role === "admin") {
    return query;
  }

  if (userContext.role === "manager") {
    if (!userContext.team_id) {
      // If manager has no team, they see no tasks (or we could default to something else, but eq(null) is safe)
      return query.eq("team_id", "00000000-0000-0000-0000-000000000000"); 
    }
    return query.eq("team_id", userContext.team_id);
  }

  if (userContext.role === "member") {
    return query.eq("assigned_to", userContext.id);
  }

  return query;
}

/**
 * Fetches tasks for a specific user based on their role and context.
 */
export async function getTasksForUser(
  userContext: UserContext, 
  options: { search?: string; status?: string; filter?: string } = {}, 
  limit?: number
) {
  const supabase = await createSupabaseServerClient();
  
  let query = supabase.from("tasks").select(`
    *,
    companies:company_id(name),
    teams:team_id(name),
    assignee:assigned_to(full_name, email),
    creator:created_by(full_name, email)
  `);

  query = applyRoleFilters(query, userContext);
  
  if (options.search) {
    query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
  }

  if (options.status === "overdue") {
    const today = new Date().toISOString().slice(0, 10);
    query = query.neq("status", "done").lt("due_date", today);
  } else if (options.status) {
    query = query.eq("status", options.status);
  }

  if (options.filter === "due_soon") {
    const today = new Date().toISOString().slice(0, 10);
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    query = query.gte("due_date", today).lte("due_date", threeDaysFromNow);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map(task => ({
    ...task,
    company_name: task.companies?.name,
    team_name: task.teams?.name,
    assignee_name: task.assignee?.full_name || task.assignee?.email,
    creator_name: task.creator?.full_name || task.creator?.email,
  })) as Task[];
}
