import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

type TaskListPreviewProps = {
  tasks: Task[];
};

export function TaskListPreview({ tasks }: TaskListPreviewProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-sm text-muted-foreground">No tasks found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition border border-transparent hover:border-border group">
          <div className="flex items-center gap-3">
            {task.status === "done" ? (
              <CheckCircle2 className="h-5 w-5 text-accent" />
            ) : ["in_progress", "in_review"].includes(task.status) ? (
              <Clock className="h-5 w-5 text-amber-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
            )}
            <div>
              <p className={cn("text-sm font-medium", task.status === "done" && "line-through text-muted-foreground")}>
                {task.title}
              </p>
              {task.company_name && (
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{task.company_name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {task.due_date && (
                <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase hidden sm:inline-block">
                  {task.due_date}
                </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
