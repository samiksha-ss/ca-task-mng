"use server";

import { requireCurrentUserContext } from "@/lib/auth/session";
import {
  clearAllNotifications,
  deleteNotification,
  markNotificationAsRead,
} from "@/services/notification-service";
import { revalidatePath } from "next/cache";

export async function markNotificationAsReadAction(notificationId: string) {
  const context = await requireCurrentUserContext();

  const result = await markNotificationAsRead(notificationId, context.user.id);

  if (!result.error) {
    revalidatePath("/notifications");
    revalidatePath("/dashboard");
  }

  return result;
}

export async function deleteNotificationAction(notificationId: string) {
  const context = await requireCurrentUserContext();

  const result = await deleteNotification(notificationId, context.user.id);

  if (!result.error) {
    revalidatePath("/notifications");
    revalidatePath("/dashboard");
  }

  return result;
}

export async function clearAllNotificationsAction() {
  const context = await requireCurrentUserContext();

  const result = await clearAllNotifications(context.user.id);

  if (!result.error) {
    revalidatePath("/notifications");
    revalidatePath("/dashboard");
  }

  return result;
}
