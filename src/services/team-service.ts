import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole, Profile, Team } from "@/types";

export type TeamSummary = Team & {
  manager_name: string | null;
  manager_email: string | null;
  member_count: number;
};

export type MemberSummary = Profile & {
  team_name: string | null;
};

export type TeamDirectoryData = {
  teams: TeamSummary[];
  members: MemberSummary[];
  error: string | null;
};

export type MemberDetailData = {
  member: MemberSummary | null;
  teams: Team[];
  error: string | null;
};

export type TeamDetailData = {
  team: TeamSummary | null;
  members: MemberSummary[];
  error: string | null;
};

type CreateTeamInput = {
  name: string;
  description?: string;
  createdBy: string;
};

type AssignManagerInput = {
  teamId: string;
  managerId: string | null;
};

type UpdateMemberInput = {
  memberId: string;
  role: AppRole;
  teamId: string | null;
  jobTitle?: string;
  isActive: boolean;
};

type UpdateTeamInput = {
  teamId: string;
  name: string;
  description?: string;
};

function isMissingRelationError(message: string | undefined) {
  return (
    message?.includes("does not exist") ||
    message?.includes("Could not find the table") ||
    message?.includes("relation") ||
    false
  );
}

function normalizeTeamSummary(
  data: unknown,
  memberCounts: Map<string, number>,
): TeamSummary | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const team = data as Record<string, unknown>;

  if (typeof team.id !== "string" || typeof team.name !== "string") {
    return null;
  }

  const manager =
    team.manager && typeof team.manager === "object"
      ? (team.manager as Record<string, unknown>)
      : null;

  return {
    id: team.id,
    name: team.name,
    description: typeof team.description === "string" ? team.description : null,
    manager_id: typeof team.manager_id === "string" ? team.manager_id : null,
    created_by: typeof team.created_by === "string" ? team.created_by : null,
    created_at: typeof team.created_at === "string" ? team.created_at : "",
    updated_at: typeof team.updated_at === "string" ? team.updated_at : "",
    manager_name:
      manager && typeof manager.full_name === "string"
        ? manager.full_name
        : typeof manager?.email === "string"
          ? manager.email
          : null,
    manager_email:
      manager && typeof manager.email === "string" ? manager.email : null,
    member_count: memberCounts.get(team.id) ?? 0,
  };
}

function normalizeMemberSummary(data: unknown): MemberSummary | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const profile = data as Record<string, unknown>;

  if (
    typeof profile.id !== "string" ||
    typeof profile.email !== "string" ||
    (profile.role !== "admin" &&
      profile.role !== "manager" &&
      profile.role !== "member")
  ) {
    return null;
  }

  const team =
    profile.teams && typeof profile.teams === "object"
      ? (profile.teams as Record<string, unknown>)
      : null;

  return {
    id: profile.id,
    full_name:
      typeof profile.full_name === "string" ? profile.full_name : null,
    email: profile.email,
    role: profile.role as AppRole,
    job_title:
      typeof profile.job_title === "string" ? profile.job_title : null,
    avatar_url:
      typeof profile.avatar_url === "string" ? profile.avatar_url : null,
    team_id: typeof profile.team_id === "string" ? profile.team_id : null,
    is_active:
      typeof profile.is_active === "boolean" ? profile.is_active : true,
    created_at:
      typeof profile.created_at === "string" ? profile.created_at : "",
    updated_at:
      typeof profile.updated_at === "string" ? profile.updated_at : "",
    team_name: team && typeof team.name === "string" ? team.name : null,
  };
}

export async function getTeamDirectoryData(): Promise<TeamDirectoryData> {
  const supabase = await createSupabaseServerClient();

  const [teamsResponse, membersResponse] = await Promise.all([
    supabase
      .from("teams")
      .select("*, manager:manager_id(full_name, email)")
      .order("name"),
    supabase
      .from("profiles")
      .select("*, teams:team_id(name)")
      .order("full_name"),
  ]);

  const teamsMissing =
    teamsResponse.error?.code === "42P01" ||
    isMissingRelationError(teamsResponse.error?.message);
  const membersMissing =
    membersResponse.error?.code === "42P01" ||
    isMissingRelationError(membersResponse.error?.message);

  if ((teamsResponse.error && !teamsMissing) || (membersResponse.error && !membersMissing)) {
    return {
      teams: [],
      members: [],
      error:
        teamsResponse.error?.message ??
        membersResponse.error?.message ??
        "Unable to load team data.",
    };
  }

  const members = Array.isArray(membersResponse.data)
    ? membersResponse.data
        .map((member) => normalizeMemberSummary(member))
        .filter((member): member is MemberSummary => member !== null)
    : [];

  const memberCounts = new Map<string, number>();

  for (const member of members) {
    if (!member.team_id) {
      continue;
    }

    memberCounts.set(member.team_id, (memberCounts.get(member.team_id) ?? 0) + 1);
  }

  const teams = Array.isArray(teamsResponse.data)
    ? teamsResponse.data
        .map((team) => normalizeTeamSummary(team, memberCounts))
        .filter((team): team is TeamSummary => team !== null)
    : [];

  return {
    teams,
    members,
    error:
      teamsMissing || membersMissing
        ? "Run the latest Supabase migrations to enable team and member management data."
        : null,
  };
}

export async function getMemberDetailData(memberId: string): Promise<MemberDetailData> {
  const supabase = await createSupabaseServerClient();

  const [memberResponse, teamsResponse] = await Promise.all([
    supabase
      .from("profiles")
      .select("*, teams:team_id(name)")
      .eq("id", memberId)
      .maybeSingle(),
    supabase.from("teams").select("*").order("name"),
  ]);

  const missing =
    memberResponse.error?.code === "42P01" ||
    isMissingRelationError(memberResponse.error?.message) ||
    teamsResponse.error?.code === "42P01" ||
    isMissingRelationError(teamsResponse.error?.message);

  if ((memberResponse.error && !missing) || (teamsResponse.error && !missing)) {
    return {
      member: null,
      teams: [],
      error: memberResponse.error?.message ?? teamsResponse.error?.message ?? "Unable to load data.",
    };
  }

  return {
    member: normalizeMemberSummary(memberResponse.data),
    teams: Array.isArray(teamsResponse.data) ? teamsResponse.data : [],
    error: missing
      ? "Run the latest Supabase migrations to enable member and team management data."
      : null,
  };
}

export async function getTeamDetailData(teamId: string): Promise<TeamDetailData> {
  const supabase = await createSupabaseServerClient();

  const [teamResponse, membersResponse] = await Promise.all([
    supabase
      .from("teams")
      .select("*, manager:manager_id(full_name, email)")
      .eq("id", teamId)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("*, teams:team_id(name)")
      .eq("team_id", teamId)
      .order("full_name"),
  ]);

  const missing =
    teamResponse.error?.code === "42P01" ||
    isMissingRelationError(teamResponse.error?.message) ||
    membersResponse.error?.code === "42P01" ||
    isMissingRelationError(membersResponse.error?.message);

  if ((teamResponse.error && !missing) || (membersResponse.error && !missing)) {
    return {
      team: null,
      members: [],
      error: teamResponse.error?.message ?? membersResponse.error?.message ?? "Unable to load data.",
    };
  }

  const members = Array.isArray(membersResponse.data)
    ? membersResponse.data
        .map((m) => normalizeMemberSummary(m))
        .filter((m): m is MemberSummary => m !== null)
    : [];

  const memberCounts = new Map<string, number>();
  memberCounts.set(teamId, members.length);

  return {
    team: normalizeTeamSummary(teamResponse.data, memberCounts),
    members,
    error: missing
      ? "Run the latest Supabase migrations to enable team and member management data."
      : null,
  };
}

export async function createTeam(input: CreateTeamInput) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("teams").insert({
    name: input.name,
    description: input.description || null,
    created_by: input.createdBy,
  });

  return {
    error: error?.message ?? null,
  };
}

export async function assignTeamManager(input: AssignManagerInput) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("teams")
    .update({
      manager_id: input.managerId,
    })
    .eq("id", input.teamId);

  return {
    error: error?.message ?? null,
  };
}

export async function updateMemberProfileAdmin(input: UpdateMemberInput) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      role: input.role,
      team_id: input.teamId,
      job_title: input.jobTitle || null,
      is_active: input.isActive,
    })
    .eq("id", input.memberId);

  return {
    error: error?.message ?? null,
  };
}

export async function updateTeam(input: UpdateTeamInput) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("teams")
    .update({
      name: input.name,
      description: input.description || null,
    })
    .eq("id", input.teamId);

  return {
    error: error?.message ?? null,
  };
}

export async function deleteTeam(teamId: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("teams").delete().eq("id", teamId);

  return {
    error: error?.message ?? null,
  };
}
