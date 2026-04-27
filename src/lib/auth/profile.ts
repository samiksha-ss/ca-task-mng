import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

type EnsureProfileResult = {
  profile: Profile | null;
  error: string | null;
};

function normalizeProfile(data: unknown): Profile | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const profile = data as Record<string, unknown>;

  if (typeof profile.id !== "string" || typeof profile.email !== "string") {
    return null;
  }

  return {
    id: profile.id,
    full_name:
      typeof profile.full_name === "string" ? profile.full_name : null,
    email: profile.email,
    role:
      profile.role === "admin" ||
      profile.role === "manager" ||
      profile.role === "member"
        ? profile.role
        : "member",
    job_title:
      typeof profile.job_title === "string" ? profile.job_title : null,
    avatar_url:
      typeof profile.avatar_url === "string" ? profile.avatar_url : null,
    team_id: typeof profile.team_id === "string" ? profile.team_id : null,
    is_active: typeof profile.is_active === "boolean" ? profile.is_active : true,
    created_at:
      typeof profile.created_at === "string" ? profile.created_at : "",
    updated_at:
      typeof profile.updated_at === "string" ? profile.updated_at : "",
  };
}

export async function ensureCurrentUserProfile(
  user: User,
): Promise<EnsureProfileResult> {
  const supabase = await createSupabaseServerClient();

  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) {
    return {
      profile: normalizeProfile(existingProfile),
      error: null,
    };
  }

  const missingTable =
    selectError?.code === "42P01" || selectError?.message.includes("profiles");

  if (selectError && !missingTable) {
    return {
      profile: null,
      error: selectError.message,
    };
  }

  const { data: rpcProfile, error: rpcError } = await supabase.rpc(
    "ensure_profile_for_current_user",
  );

  if (rpcError) {
    return {
      profile: null,
      error: rpcError.message,
    };
  }

  return {
    profile: normalizeProfile(rpcProfile),
    error: null,
  };
}

export async function getCurrentUserProfile(
  user: User,
): Promise<EnsureProfileResult> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return {
      profile: null,
      error: error.message,
    };
  }

  return {
    profile: normalizeProfile(data),
    error: null,
  };
}
