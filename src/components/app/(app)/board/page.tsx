import { PageHeader } from "@/components/layout/page-header";
import { toneMap } from "@/lib/ui/tone-map";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { TaskBoard } from "@/features/tasks/components/task-board";
import { pageIdentities } from "@/lib/constants/page-identities";
import { getTaskPageData } from "@/services/task-service";

export default async function BoardPage() {
  const identity = pageIdentities.board;
  const IdentityIcon = identity.icon;
  const { tasks, error } = await getTaskPageData(100);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={identity.eyebrow}
        title="Board"
        description="Track visible work by status in a Kanban-style layout built directly on top of the task module."
        icon={<IdentityIcon className="h-5 w-5" />}
        tone={toneMap[identity.tone]}
      />

      {error ? <AuthStatusMessage tone="info" message={error} /> : null}

      <TaskBoard tasks={tasks} />
    </section>
  );
}
