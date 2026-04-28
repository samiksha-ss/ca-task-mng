import { PageHeader } from "@/components/layout/page-header";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { TaskCalendar } from "@/features/tasks/components/task-calendar";
import { getTaskPageData } from "@/services/task-service";

export default async function CalendarPage() {
  const { tasks, error } = await getTaskPageData(100);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Scheduling view"
        title="Calendar"
        description="Review task deadlines in a monthly calendar and agenda view so upcoming due work is easier to spot."
      />

      {error ? <AuthStatusMessage tone="info" message={error} /> : null}

      <TaskCalendar tasks={tasks} />
    </section>
  );
}
