import { PageHeader } from "@/components/layout/page-header";
import { toneMap } from "@/lib/ui/tone-map";
import { AuthStatusMessage } from "@/features/auth/components/auth-status-message";
import { TaskCalendar } from "@/features/tasks/components/task-calendar";
import { pageIdentities } from "@/lib/constants/page-identities";
import { getTaskPageData } from "@/services/task-service";

import { getUserContext } from "@/lib/auth/session";

export default async function CalendarPage() {
  const identity = pageIdentities.calendar;
  const IdentityIcon = identity.icon;
  const userContext = await getUserContext();
  const { tasks, error } = await getTaskPageData(userContext, 100);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={identity.eyebrow}
        title="Calendar"
        description="Review task deadlines in a monthly calendar and agenda view so upcoming due work is easier to spot."
        icon={<IdentityIcon className="h-5 w-5" />}
        tone={toneMap[identity.tone]}
      />

      {error ? <AuthStatusMessage tone="info" message={error} /> : null}

      <TaskCalendar tasks={tasks} />
    </section>
  );
}
