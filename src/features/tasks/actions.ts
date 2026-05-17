"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUserContext } from "@/lib/auth/session";
import { TASKS_PATH } from "@/lib/constants/routes";
import { createTaskSchema, deleteTaskSchema, updateTaskSchema } from "./schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TaskStatus } from "@/types";
import { 
  createRecurringTasks, 
  updateThisOccurrenceOnlyTask, 
  updateThisAndFutureTasks, 
  updateEntireSeriesTasks, 
  deleteRecurringTasks,
  handleSequentialTaskCompletion
} from "@/services/recurrence-service";
import type { RecurrenceRule, RecurrenceIntervalType, RecurrenceEndType } from "@/lib/utils/recurrence";


export async function updateTaskStatusAction(taskId: string, status: TaskStatus) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tasks")
    .update({ 
      status,
      completed_at: status === "done" ? new Date().toISOString() : null
    })
    .eq("id", taskId);

  if (!error) {
    if (status === "done") {
      await handleSequentialTaskCompletion(taskId);
    }
    revalidatePath(TASKS_PATH);
    revalidatePath(`/tasks/${taskId}`);
    revalidatePath("/dashboard");
  }

  return { error: error?.message ?? null };
}

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

  const recurrenceEnabled = formData.get("recurrenceEnabled") === "true";
  const recurrenceRule: RecurrenceRule = recurrenceEnabled ? {
    intervalType: (formData.get("recurrenceIntervalType") as RecurrenceIntervalType) || "none",
    intervalCount: parseInt(formData.get("recurrenceIntervalCount") as string || "1", 10),
    weekdays: formData.get("recurrenceWeekdays") as string || null,
    endType: (formData.get("recurrenceEndType") as RecurrenceEndType) || "never",
    endDate: formData.get("recurrenceEndDate") as string || null,
    endCount: formData.get("recurrenceEndCount") ? parseInt(formData.get("recurrenceEndCount") as string, 10) : null,
  } : {
    intervalType: "none",
    intervalCount: 1,
    endType: "never",
  };

  const { error } = await createRecurringTasks({
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
  }, recurrenceRule);

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

  const editType = (formData.get("editType") as "one" | "future" | "all") || "one";
  const instanceDate = (formData.get("instanceDate") as string) || payload.dueDate || "";

  const recurrenceEnabled = formData.get("recurrenceEnabled") === "true";
  const recurrenceRule: RecurrenceRule = recurrenceEnabled ? {
    intervalType: (formData.get("recurrenceIntervalType") as RecurrenceIntervalType) || "none",
    intervalCount: parseInt(formData.get("recurrenceIntervalCount") as string || "1", 10),
    weekdays: formData.get("recurrenceWeekdays") as string || null,
    endType: (formData.get("recurrenceEndType") as RecurrenceEndType) || "never",
    endDate: formData.get("recurrenceEndDate") as string || null,
    endCount: formData.get("recurrenceEndCount") ? parseInt(formData.get("recurrenceEndCount") as string, 10) : null,
  } : {
    intervalType: "none",
    intervalCount: 1,
    endType: "never",
  };

  let result;
  const taskData = {
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
  };

  if (editType === "one") {
    result = await updateThisOccurrenceOnlyTask(payload.taskId, taskData);
  } else if (editType === "future" && instanceDate) {
    result = await updateThisAndFutureTasks(payload.taskId, instanceDate, taskData, recurrenceRule);
  } else {
    // Edit entire series
    result = await updateEntireSeriesTasks(payload.taskId, taskData, recurrenceRule);
  }

  const { error } = result;

  if (error) {
    return {
      ...initialState,
      error,
    };
  }

  if (payload.status === "done") {
    await handleSequentialTaskCompletion(payload.taskId);
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

  const deleteType = (formData.get("deleteType") as "one" | "future" | "all") || "one";
  const instanceDate = (formData.get("instanceDate") as string) || "";
  const { error } = await deleteRecurringTasks(parsed.data.taskId, deleteType, instanceDate);

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
