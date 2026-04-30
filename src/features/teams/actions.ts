"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUserContext } from "@/lib/auth/session";
import {
  assignTeamManager,
  createTeam,
  updateMemberProfileAdmin,
  updateTeam,
  deleteTeam,
} from "@/services/team-service";
import { redirect } from "next/navigation";
import { TEAMS_PATH } from "@/lib/constants/routes";
import { 
  assignManagerSchema, 
  createTeamSchema, 
  updateMemberSchema,
  updateTeamSchema,
  deleteTeamSchema,
} from "./schema";

export type TeamAdminActionState = {
  error: string | null;
  success: string | null;
};

const initialState: TeamAdminActionState = {
  error: null,
  success: null,
};

function requireAdminRole(role: string | null | undefined) {
  return role === "admin";
}

function revalidateManagementPaths() {
  revalidatePath("/admin/users");
  revalidatePath("/teams");
  revalidatePath("/members");
}

export async function createTeamAction(
  _previousState: TeamAdminActionState,
  formData: FormData,
): Promise<TeamAdminActionState> {
  const context = await requireCurrentUserContext();

  if (!requireAdminRole(context.profile?.role)) {
    return {
      ...initialState,
      error: "Only admins can create teams.",
    };
  }

  const parsed = createTeamSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return {
      ...initialState,
      error: parsed.error.issues[0]?.message ?? "Unable to create team.",
    };
  }

  const { error } = await createTeam({
    name: parsed.data.name,
    description: parsed.data.description,
    createdBy: context.user.id,
  });

  if (error) {
    return {
      ...initialState,
      error,
    };
  }

  revalidateManagementPaths();

  return {
    ...initialState,
    success: "Team created successfully.",
  };
}

export async function assignManagerAction(
  _previousState: TeamAdminActionState,
  formData: FormData,
): Promise<TeamAdminActionState> {
  const context = await requireCurrentUserContext();

  if (!requireAdminRole(context.profile?.role)) {
    return {
      ...initialState,
      error: "Only admins can assign team managers.",
    };
  }

  const parsed = assignManagerSchema.safeParse({
    teamId: formData.get("teamId"),
    managerId: formData.get("managerId") || null,
  });

  if (!parsed.success) {
    return {
      ...initialState,
      error: parsed.error.issues[0]?.message ?? "Unable to assign manager.",
    };
  }

  const { error } = await assignTeamManager(parsed.data);

  if (error) {
    return {
      ...initialState,
      error,
    };
  }

  revalidateManagementPaths();

  return {
    ...initialState,
    success: "Team manager updated successfully.",
  };
}

export async function updateMemberAction(
  _previousState: TeamAdminActionState,
  formData: FormData,
): Promise<TeamAdminActionState> {
  const context = await requireCurrentUserContext();

  if (!requireAdminRole(context.profile?.role)) {
    return {
      ...initialState,
      error: "Only admins can update members.",
    };
  }

  const parsed = updateMemberSchema.safeParse({
    memberId: formData.get("memberId"),
    role: formData.get("role"),
    teamId: formData.get("teamId") || null,
    jobTitle: formData.get("jobTitle"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return {
      ...initialState,
      error: parsed.error.issues[0]?.message ?? "Unable to update member.",
    };
  }

  const { error } = await updateMemberProfileAdmin(parsed.data);

  if (error) {
    return {
      ...initialState,
      error,
    };
  }

  revalidateManagementPaths();

  return {
    ...initialState,
    success: "Member updated successfully.",
  };
}

export async function updateTeamAction(
  _previousState: TeamAdminActionState,
  formData: FormData,
): Promise<TeamAdminActionState> {
  const context = await requireCurrentUserContext();

  if (!requireAdminRole(context.profile?.role)) {
    return {
      ...initialState,
      error: "Only admins can update teams.",
    };
  }

  const parsed = updateTeamSchema.safeParse({
    teamId: formData.get("teamId"),
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return {
      ...initialState,
      error: parsed.error.issues[0]?.message ?? "Unable to update team.",
    };
  }

  const { error } = await updateTeam(parsed.data);

  if (error) {
    return {
      ...initialState,
      error,
    };
  }

  revalidateManagementPaths();

  return {
    ...initialState,
    success: "Team updated successfully.",
  };
}

export async function deleteTeamAction(
  _previousState: TeamAdminActionState,
  formData: FormData,
): Promise<TeamAdminActionState> {
  const context = await requireCurrentUserContext();

  if (!requireAdminRole(context.profile?.role)) {
    return {
      ...initialState,
      error: "Only admins can delete teams.",
    };
  }

  const parsed = deleteTeamSchema.safeParse({
    teamId: formData.get("teamId"),
  });

  if (!parsed.success) {
    return {
      ...initialState,
      error: parsed.error.issues[0]?.message ?? "Unable to delete team.",
    };
  }

  const { error } = await deleteTeam(parsed.data.teamId);

  if (error) {
    return {
      ...initialState,
      error,
    };
  }

  revalidateManagementPaths();
  redirect(TEAMS_PATH);
}
