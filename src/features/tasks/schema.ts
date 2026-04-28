import { z } from "zod";
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "@/lib/constants/app";

const baseTaskSchema = z.object({
  title: z.string().trim().min(3, "Task title must be at least 3 characters."),
  description: z.string().trim().optional(),
  companyId: z.string().uuid("Select a valid company.").nullable().optional(),
  teamId: z.string().uuid("Select a valid team.").nullable().optional(),
  assignedTo: z.string().uuid("Select a valid assignee.").nullable().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(TASK_PRIORITY_OPTIONS),
  status: z.enum(TASK_STATUS_OPTIONS),
  estimatedMinutes: z.coerce
    .number()
    .int()
    .min(0, "Estimated minutes cannot be negative."),
  billable: z.boolean(),
});

export const createTaskSchema = baseTaskSchema;

export const updateTaskSchema = baseTaskSchema.extend({
  taskId: z.string().uuid("Select a valid task."),
});

export const deleteTaskSchema = z.object({
  taskId: z.string().uuid("Select a valid task."),
});
