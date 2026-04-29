import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Team } from "@/types";

export type SettingsPageData = {
  teams: Team[];
  error: string | null;
};

type UpdateProfileInput = {
  userId: string;
  fullName?: string;
  jobTitle?: string;
};

function normalizeTeam(data: unknown): Team | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const team = data as Record<string, unknown>;

  if (typeof team.id !== "string" || typeof team.name !== "string") {
    return null;
  }

  return {
    id: team.id,
    name: team.name,
    description: typeof team.description === "string" ? team.description : null,
    manager_id: typeof team.manager_id === "string" ? team.manager_id : null,
    created_by: typeof team.created_by === "string" ? team.created_by : null,
    created_at: typeof team.created_at === "string" ? team.created_at : "",
    updated_at: typeof team.updated_at === "string" ? team.updated_at : "",
  };
}

function isMissingRelationError(message: string | undefined) {
  return (
    message?.includes("does not exist") ||
    message?.includes("Could not find the table") ||
    message?.includes("relation") ||
    false
  );
}

export async function getSettingsPageData(): Promise<SettingsPageData> {
  const supabase = await createSupabaseServerClient();
  const response = await supabase.from("teams").select("*").order("name");

  const missing =
    response.error?.code === "42P01" ||
    isMissingRelationError(response.error?.message);

  if (response.error && !missing) {
    return {
      teams: [],
      error: response.error.message,
    };
  }

  return {
    teams: Array.isArray(response.data)
      ? response.data
          .map((team) => normalizeTeam(team))
          .filter((team): team is Team => team !== null)
      : [],
    error: missing
      ? "Run the latest Supabase migrations to enable workspace settings data."
      : null,
  };
}

export async function updateCurrentUserProfile(input: UpdateProfileInput) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName || null,
      job_title: input.jobTitle || null,
    })
    .eq("id", input.userId);

  return {
    error: error?.message ?? null,
  };
}
