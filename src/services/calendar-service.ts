import { getCalendarData, type CalendarItem } from "@/lib/queries/calendar";
import { getUserContext } from "@/lib/auth/session";
import { startOfMonth, endOfMonth, subDays, addDays, format } from "date-fns";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCalendarPageData(targetDate?: Date): Promise<{ items: CalendarItem[], error: string | null }> {
  try {
    const userContext = await getUserContext();
    
    // Default to current month if no target date provided
    const baseDate = targetDate || new Date();
    
    // Fetch a bit wider than the current month to populate leading/trailing grid days
    const startDate = format(subDays(startOfMonth(baseDate), 7), "yyyy-MM-dd");
    const endDate = format(addDays(endOfMonth(baseDate), 7), "yyyy-MM-dd");

    const items = await getCalendarData(userContext, startDate, endDate);
    
    return { items, error: null };
  } catch (error) {
    console.error("Failed to fetch calendar data:", error);
    return { items: [], error: "Failed to load calendar events and tasks." };
  }
}

export async function createEvent(eventData: {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  created_by: string;
}) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get user's team_id to associate with the event
    const { data: profile } = await supabase
      .from("profiles")
      .select("team_id")
      .eq("id", eventData.created_by)
      .single();

    const { data, error } = await supabase
      .from("events")
      .insert({
        ...eventData,
        team_id: profile?.team_id || null,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Failed to create event:", error);
    const message = error instanceof Error ? error.message : "Failed to create event";
    return { data: null, error: message };
  }
}

