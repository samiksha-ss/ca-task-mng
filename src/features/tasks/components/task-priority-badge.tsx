import { cn } from "@/lib/utils";
import type { TaskPriority } from "@/types";

const priorityClasses: Record<TaskPriority, string> = {
  low: "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300",
  medium:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300",
  urgent: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
};

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        priorityClasses[priority],
      )}
    >
      {priority}
    </span>
  );
}
