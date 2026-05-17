/* eslint-disable @typescript-eslint/no-explicit-any */
import { getEventsForCalendar } from "./events";
import { getTasksForCalendar, type UserContext } from "./tasks";
import { generateOccurrences, formatToISODate } from "@/lib/utils/recurrence";

export type CalendarItemType = "task" | "event";

export interface CalendarItem {
  id: string;
  type: CalendarItemType;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM if applicable
  status?: string; // Task status
  assignee?: string; // Task assignee name or Event creator name
}

export async function getCalendarData(
  userContext: UserContext,
  startDate: string,
  endDate: string
): Promise<CalendarItem[]> {
  const [events, tasks] = await Promise.all([
    getEventsForCalendar(userContext, startDate, endDate),
    getTasksForCalendar(userContext, startDate, endDate)
  ]);

  const items: CalendarItem[] = [];

  events.forEach(event => {
    // Assuming start_time is an ISO string "YYYY-MM-DDTHH:mm:ss.sssZ"
    const dateObj = new Date(event.start_time);
    const dateStr = dateObj.toISOString().split("T")[0];
    const timeStr = dateObj.toISOString().split("T")[1].substring(0, 5);

    items.push({
      id: `event_${event.id}`,
      type: "event",
      title: event.title,
      date: dateStr,
      time: timeStr,
      assignee: event.creator_name || "Unknown",
    });
  });

  tasks.forEach(task => {
    if (!task.due_date) return;
    
    // task.due_date might already be YYYY-MM-DD or a full ISO string
    const dateStr = task.due_date.includes("T") 
      ? new Date(task.due_date).toISOString().split("T")[0]
      : task.due_date;

    items.push({
      id: `task_${task.id}`,
      type: "task",
      title: task.title,
      date: dateStr,
      status: task.status,
      assignee: task.assignee_name || "Unassigned",
    });

    // Preview future occurrences visually without database rows
    if (task.recurrence_interval_type && task.recurrence_interval_type !== "none") {
      const rule = {
        intervalType: task.recurrence_interval_type as any,
        intervalCount: task.recurrence_interval_count ?? 1,
        weekdays: task.recurrence_weekdays || null,
        endType: task.recurrence_end_type as any,
        endDate: task.recurrence_end_date || null,
        endCount: task.recurrence_end_count || null,
      };

      const baseDate = new Date(task.due_date);
      const limitDate = endDate ? new Date(endDate) : new Date();
      
      const occurrences = generateOccurrences(baseDate, rule, limitDate);
      
      occurrences.forEach(occ => {
        const occDateStr = formatToISODate(occ);
        if (occDateStr === dateStr) return;

        // Prevent rendering duplicate visual cards if a real task instance exists for this date
        const hasDbInstance = tasks.some(t => 
          (t.recurrence_parent_id === task.recurrence_parent_id || t.id === task.recurrence_parent_id || t.recurrence_parent_id === task.id) &&
          (t.due_date && (t.due_date.includes("T") ? new Date(t.due_date).toISOString().split("T")[0] : t.due_date) === occDateStr)
        );

        if (hasDbInstance) return;

        items.push({
          id: `task_preview_${task.id}_${occDateStr}`,
          type: "task",
          title: `${task.title} (Upcoming Preview)`,
          date: occDateStr,
          status: "todo",
          assignee: task.assignee_name || "Unassigned",
        });
      });
    }
  });

  // Sort by date then time
  items.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    const timeA = a.time || "00:00";
    const timeB = b.time || "00:00";
    return timeA.localeCompare(timeB);
  });

  return items;
}
