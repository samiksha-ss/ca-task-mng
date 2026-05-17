/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TimeEntry = {
  id: string;
  task_id: string;
  user_id: string;
  minutes: number;
  description: string | null;
  logged_date: string;
  created_at: string;
  user_name: string;
  user_email: string;
};

export async function getTimeEntriesForTask(taskId: string): Promise<TimeEntry[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("time_entries")
    .select(`
      *,
      user:user_id(full_name, email)
    `)
    .eq("task_id", taskId)
    .order("logged_date", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((entry: any) => ({
    id: entry.id,
    task_id: entry.task_id,
    user_id: entry.user_id,
    minutes: entry.minutes,
    description: entry.description,
    logged_date: entry.logged_date,
    created_at: entry.created_at,
    user_name: entry.user?.full_name || entry.user?.email || "Unknown Profile",
    user_email: entry.user?.email || "",
  }));
}

async function syncTaskActualMinutes(taskId: string) {
  const supabase = await createSupabaseServerClient();
  
  // Calculate total minutes
  const { data, error } = await supabase
    .from("time_entries")
    .select("minutes")
    .eq("task_id", taskId);

  if (error) return;

  const totalMinutes = (data || []).reduce((sum, entry) => sum + entry.minutes, 0);

  // Update actual_minutes in tasks
  await supabase
    .from("tasks")
    .update({ actual_minutes: totalMinutes })
    .eq("id", taskId);
}

export async function createTimeEntry(input: {
  taskId: string;
  userId: string;
  minutes: number;
  description?: string;
  loggedDate?: string;
}) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("time_entries")
    .insert({
      task_id: input.taskId,
      user_id: input.userId,
      minutes: input.minutes,
      description: input.description || null,
      logged_date: input.loggedDate || new Date().toISOString().slice(0, 10),
    });

  if (!error) {
    await syncTaskActualMinutes(input.taskId);
  }

  return {
    error: error?.message ?? null,
  };
}

export async function deleteTimeEntry(entryId: string, taskId: string, userId: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("time_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", userId);

  if (!error) {
    await syncTaskActualMinutes(taskId);
  }

  return {
    error: error?.message ?? null,
  };
}
