"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUserContext } from "@/lib/auth/session";
import { updateCurrentUserProfile } from "@/services/profile-service";
import { updateProfileSchema } from "./schema";

export type SettingsActionState = {
  error: string | null;
  success: string | null;
};

const initialState: SettingsActionState = {
  error: null,
  success: null,
};

export async function updateProfileAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const context = await requireCurrentUserContext();
  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    jobTitle: formData.get("jobTitle"),
  });

  if (!parsed.success) {
    return {
      ...initialState,
      error: parsed.error.issues[0]?.message ?? "Unable to update profile.",
    };
  }

  const { error } = await updateCurrentUserProfile({
    userId: context.user.id,
    fullName: parsed.data.fullName,
    jobTitle: parsed.data.jobTitle,
  });

  if (error) {
    return {
      ...initialState,
      error,
    };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return {
    ...initialState,
    success: "Profile updated successfully.",
  };
}
