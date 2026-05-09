import { getEventsForCalendar } from "./events";
import { getTasksForCalendar, type UserContext } from "./tasks";

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
