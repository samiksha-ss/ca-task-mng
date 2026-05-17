"use server";

import { requireCurrentUserContext } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileNameAction(fullName: string) {
  try {
    const context = await requireCurrentUserContext();
    const trimmed = fullName.trim();
    if (!trimmed) {
      return { error: "Full name cannot be empty." };
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: trimmed })
      .eq("id", context.user.id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Settings profile update error:", err);
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { error: message };
  }
}

export async function updateUserPasswordAction(password: string) {
  try {
    await requireCurrentUserContext();
    if (!password || password.length < 6) {
      return { error: "Password must be at least 6 characters long." };
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Settings password update error:", err);
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { error: message };
  }
}
