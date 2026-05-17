"use server";

import { requireCurrentUserContext } from "@/lib/auth/session";
import { createTimeEntry, deleteTimeEntry } from "@/services/time-service";
import { revalidatePath } from "next/cache";

export async function createTimeEntryAction(input: {
  taskId: string;
  minutes: number;
  description?: string;
  loggedDate?: string;
}) {
  const context = await requireCurrentUserContext();

  const result = await createTimeEntry({
    taskId: input.taskId,
    userId: context.user.id,
    minutes: input.minutes,
    description: input.description,
    loggedDate: input.loggedDate,
  });

  if (!result.error) {
    revalidatePath(`/tasks/${input.taskId}`);
    revalidatePath("/dashboard");
  }

  return result;
}

export async function deleteTimeEntryAction(input: {
  entryId: string;
  taskId: string;
}) {
  const context = await requireCurrentUserContext();

  const result = await deleteTimeEntry(input.entryId, input.taskId, context.user.id);

  if (!result.error) {
    revalidatePath(`/tasks/${input.taskId}`);
    revalidatePath("/dashboard");
  }

  return result;
}
