import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types";

const statusClasses: Record<TaskStatus, string> = {
  backlog: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  todo: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  in_progress:
    "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
  in_review:
    "bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300",
  done: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  blocked: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        statusClasses[status],
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
