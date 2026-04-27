import { redirect } from "next/navigation";
import { APP_HOME_PATH, LOGIN_PATH } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { ensureCurrentUserProfile } from "@/lib/auth/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CurrentUserContext } from "@/types/auth";

export async function getSessionUser() {
  if (!isSupabaseConfigured) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireSessionUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect(LOGIN_PATH);
  }

  return user;
}

export async function getCurrentUserContext(): Promise<CurrentUserContext | null> {
  const user = await getSessionUser();

  if (!user) {
    return null;
  }

  const { profile, error } = await ensureCurrentUserProfile(user);

  return {
    user,
    profile,
    profileError: error,
  };
}

export async function requireCurrentUserContext() {
  const context = await getCurrentUserContext();

  if (!context) {
    redirect(LOGIN_PATH);
  }

  return context;
}

export async function redirectIfAuthenticated() {
  const user = await getSessionUser();

  if (user) {
    redirect(APP_HOME_PATH);
  }
}
