import { PageHeader } from "@/components/layout/page-header";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { TaskBoard } from "@/features/tasks/components/task-board";
import { getTaskPageData } from "@/services/task-service";

import { getUserContext } from "@/lib/auth/session";

export default async function BoardPage() {
  const userContext = await getUserContext();
  const { tasks, error } = await getTaskPageData(userContext, 100);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Workflow view"
        title="Board"
        description="Track visible work by status in a Kanban-style layout built directly on top of the task module."
      />

      {error ? <AuthStatusMessage tone="info" message={error} /> : null}

      <TaskBoard tasks={tasks} />
    </section>
  );
}
