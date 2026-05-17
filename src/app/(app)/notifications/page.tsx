import { PageHeader } from "@/components/layout/page-header";
import { NotificationList } from "@/components/notifications/notification-list";
import { getNotificationsForUser } from "@/services/notification-service";
import { requireCurrentUserContext } from "@/lib/auth/session";

export default async function NotificationsPage() {
  const context = await requireCurrentUserContext();
  const notifications = await getNotificationsForUser(context.user.id);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Workspace feed"
        title="Notifications"
        description="Stay updated with instant delivery alerts, task modifications, comments, and reminders in one place."
      />

      <div className="rounded-[32px] border border-border bg-card p-6 md:p-8 shadow-sm">
        <NotificationList notifications={notifications} />
      </div>
    </section>
  );
}
