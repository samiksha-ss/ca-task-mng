import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Event } from "@/types/event";
import type { UserContext } from "./tasks"; // Reuse UserContext definition from tasks

export async function getEventsForCalendar(
  userContext: UserContext,
  startDate?: string,
  endDate?: string
): Promise<Event[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("events")
    .select(`
      *,
      creator:created_by(full_name, email)
    `);

  if (startDate) query = query.gte("start_time", startDate);
  if (endDate) query = query.lte("start_time", endDate);

  // Apply role-based filtering
  if (userContext.role === "manager" && userContext.team_id) {
    query = query.eq("team_id", userContext.team_id);
  } else if (userContext.role === "member") {
    // For members, showing events they created or are in their team
    if (userContext.team_id) {
      query = query.eq("team_id", userContext.team_id);
    } else {
      query = query.eq("created_by", userContext.id);
    }
  }

  const { data, error } = await query.order("start_time", { ascending: true });

  if (error || !data) return [];

  return data.map(event => ({
    ...event,
    creator_name: event.creator?.full_name || event.creator?.email
  })) as Event[];
}
