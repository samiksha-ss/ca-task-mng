import type { AppRole } from "@/types";

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  manager: "Manager",
  member: "Member",
};

export const TASK_STATUS_OPTIONS = [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "done",
  "blocked",
] as const;

export const TASK_PRIORITY_OPTIONS = [
  "low",
  "medium",
  "high",
  "urgent",
] as const;
