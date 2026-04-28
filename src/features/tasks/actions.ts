"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUserContext } from "@/lib/auth/session";
import { TASKS_PATH } from "@/lib/constants/routes";
import { createTask, deleteTask, updateTask } from "@/services/task-service";
import { createTaskSchema, deleteTaskSchema, updateTaskSchema } from "./schema";

export type TaskActionState = {
  error: string | null;
  success: string | null;
};

const initialState: TaskActionState = {
  error: null,
  success: null,
};

export async function createTaskAction(
  _previousState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const context = await requireCurrentUserContext();
  const parsed = createTaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    companyId: formData.get("companyId") || null,
    teamId: formData.get("teamId") || null,
    assignedTo: formData.get("assignedTo") || null,
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
    status: formData.get("status"),
    estimatedMinutes: formData.get("estimatedMinutes"),
    billable: formData.get("billable") === "on",
  });

  if (!parsed.success) {
    return {
      ...initialState,
      error: parsed.error.issues[0]?.message ?? "Unable to create task.",
    };
  }

  const payload = parsed.data;
  const profile = context.profile;

  const teamId =
    profile?.role === "member"
      ? profile.team_id ?? null
      : payload.teamId ?? profile?.team_id ?? null;

  const assignedTo =
    profile?.role === "member"
      ? context.user.id
      : payload.assignedTo ?? context.user.id;

  const { error } = await createTask({
    title: payload.title,
    description: payload.description,
    companyId: payload.companyId ?? null,
    teamId,
    assignedTo,
    dueDate: payload.dueDate,
    priority: payload.priority,
    status: payload.status,
    estimatedMinutes: payload.estimatedMinutes,
    billable: payload.billable,
    createdBy: context.user.id,
  });

  if (error) {
    return {
      ...initialState,
      error,
    };
  }

  revalidatePath(TASKS_PATH);
  revalidatePath("/dashboard");

  return {
    ...initialState,
    success: "Task created successfully.",
  };
}

export async function updateTaskAction(
  _previousState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const context = await requireCurrentUserContext();
  const parsed = updateTaskSchema.safeParse({
    taskId: formData.get("taskId"),
    title: formData.get("title"),
    description: formData.get("description"),
    companyId: formData.get("companyId") || null,
    teamId: formData.get("teamId") || null,
    assignedTo: formData.get("assignedTo") || null,
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
    status: formData.get("status"),
    estimatedMinutes: formData.get("estimatedMinutes"),
    billable: formData.get("billable") === "on",
  });

  if (!parsed.success) {
    return {
      ...initialState,
      error: parsed.error.issues[0]?.message ?? "Unable to update task.",
    };
  }

  const payload = parsed.data;
  const profile = context.profile;

  const teamId =
    profile?.role === "member"
      ? profile.team_id ?? null
      : payload.teamId ?? profile?.team_id ?? null;

  const assignedTo =
    profile?.role === "member"
      ? context.user.id
      : payload.assignedTo ?? null;

  const { error } = await updateTask({
    taskId: payload.taskId,
    title: payload.title,
    description: payload.description,
    companyId: payload.companyId ?? null,
    teamId,
    assignedTo,
    dueDate: payload.dueDate,
    priority: payload.priority,
    status: payload.status,
    estimatedMinutes: payload.estimatedMinutes,
    billable: payload.billable,
  });

  if (error) {
    return {
      ...initialState,
      error,
    };
  }

  revalidatePath(TASKS_PATH);
  revalidatePath(`/tasks/${payload.taskId}`);
  revalidatePath("/dashboard");

  return {
    ...initialState,
    success: "Task updated successfully.",
  };
}

export async function deleteTaskAction(
  _previousState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  await requireCurrentUserContext();
  const parsed = deleteTaskSchema.safeParse({
    taskId: formData.get("taskId"),
  });

  if (!parsed.success) {
    return {
      ...initialState,
      error: parsed.error.issues[0]?.message ?? "Unable to delete task.",
    };
  }

  const { error } = await deleteTask(parsed.data.taskId);

  if (error) {
    return {
      ...initialState,
      error,
    };
  }

  revalidatePath(TASKS_PATH);
  revalidatePath("/dashboard");
  redirect(TASKS_PATH);
}
