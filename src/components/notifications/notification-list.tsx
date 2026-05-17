"use client";

import { useState } from "react";
import {
  markNotificationAsReadAction,
  deleteNotificationAction,
  clearAllNotificationsAction,
} from "@/lib/actions/notifications";
import type { Notification } from "@/services/notification-service";
import { Bell, BellOff, Trash2, CheckCircle2, Link as LinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type NotificationListProps = {
  notifications: Notification[];
};

export function NotificationList({ notifications }: NotificationListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    setLoadingId(id);
    try {
      const { error } = await markNotificationAsReadAction(id);
      if (error) {
        alert(error);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (loadingId) return;
    setLoadingId(id);
    try {
      const { error } = await deleteNotificationAction(id);
      if (error) {
        alert(error);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleClearAll = async () => {
    if (clearing || notifications.length === 0 || !confirm("Are you sure you want to clear all notifications?")) return;

    setClearing(true);
    try {
      const { error } = await clearAllNotificationsAction();
      if (error) {
        alert(error);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClearing(false);
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 bg-card rounded-[32px] border border-border border-dashed">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <BellOff className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">All caught up!</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          You don&apos;t have any notifications or action alerts in your workspace feed right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-accent/15 px-3 py-1 rounded-full text-accent">
            {unreadCount} unread
          </span>
        </div>
        <button
          disabled={clearing}
          onClick={handleClearAll}
          className="inline-flex h-9 items-center justify-center rounded-xl border border-red-500/20 bg-card px-4 text-xs font-bold text-red-500 hover:bg-red-500/5 hover:border-red-500/30 transition active:scale-95 cursor-pointer"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={[
              "rounded-[24px] border p-5 shadow-sm transition-all flex items-start gap-4 hover:shadow-md relative overflow-hidden group",
              notification.read
                ? "bg-card border-border/80"
                : "bg-gradient-to-br from-accent/[0.03] to-transparent border-accent/30",
            ].join(" ")}
          >
            {/* Status Indicator */}
            {!notification.read && (
              <span className="absolute top-0 left-0 w-1.5 h-full bg-accent" />
            )}

            <div className={[
              "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border shadow-sm",
              notification.read
                ? "bg-muted/40 border-border text-muted-foreground"
                : "bg-accent/10 border-accent/20 text-accent",
            ].join(" ")}>
              <Bell className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-3">
                <h4 className={[
                  "text-sm font-bold truncate leading-none",
                  notification.read ? "text-foreground/90" : "text-foreground",
                ].join(" ")}>
                  {notification.title}
                </h4>
                <span className="text-[10px] text-muted-foreground font-semibold shrink-0">
                  {new Date(notification.created_at).toLocaleDateString("en-IN", {
                    dateStyle: "medium",
                  })}{" "}
                  {new Date(notification.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground max-w-3xl">
                {notification.message}
              </p>

              {notification.link && (
                <div className="pt-2">
                  <Link
                    href={notification.link}
                    onClick={() => {
                      if (!notification.read) {
                        handleMarkRead(notification.id);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:opacity-85 transition"
                  >
                    <LinkIcon className="h-3 w-3" /> View related item
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 self-center">
              {!notification.read && (
                <button
                  disabled={loadingId === notification.id}
                  onClick={() => handleMarkRead(notification.id)}
                  className="h-8 w-8 rounded-lg hover:bg-accent/10 flex items-center justify-center text-accent shrink-0 cursor-pointer shadow-sm border border-border"
                  title="Mark as read"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              )}
              <button
                disabled={loadingId === notification.id}
                onClick={() => handleDelete(notification.id)}
                className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center text-muted-foreground shrink-0 cursor-pointer shadow-sm border border-border group-hover:opacity-100 group-hover:border-red-500/10"
                title="Delete notification"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
