import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
};

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data;
}

export async function createNotification(input: {
  userId: string;
  title: string;
  message: string;
  link?: string;
}) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("notifications")
    .insert({
      user_id: input.userId,
      title: input.title,
      message: input.message,
      link: input.link || null,
    });

  return {
    error: error?.message ?? null,
  };
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", userId);

  return {
    error: error?.message ?? null,
  };
}

export async function deleteNotification(notificationId: string, userId: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", userId);

  return {
    error: error?.message ?? null,
  };
}

export async function clearAllNotifications(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", userId);

  return {
    error: error?.message ?? null,
  };
}
