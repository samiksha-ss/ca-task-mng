import { getEvents } from "@/lib/queries/events";
import { getTaskPageData } from "@/services/task-service";
import { getUserContext, requireCurrentUserContext } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { CalendarView } from "@/components/calendar/calendar-view";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";

export default async function CalendarPage() {
  const context = isSupabaseConfigured ? await requireCurrentUserContext() : null;
  const userContext = await getUserContext();
  const userId = context?.user?.id ?? "";

  const [events, taskData] = await Promise.all([
    getEvents(),
    getTaskPageData(userContext, 100)
  ]);

  return (
    <section className="space-y-6 pb-8">
      {taskData.error && <AuthStatusMessage tone="info" message={taskData.error} />}
      
      <CalendarView 
        tasks={taskData.tasks} 
        events={events} 
        userId={userId} 
      />
    </section>
  );
}
