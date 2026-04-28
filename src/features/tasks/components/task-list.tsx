import Link from "next/link";
import { getTaskDetailPath } from "@/lib/constants/routes";
import type { Task } from "@/types";
import { TaskPriorityBadge } from "./task-priority-badge";
import { TaskStatusBadge } from "./task-status-badge";

type TaskListProps = {
  tasks: Task[];
};

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-border bg-card p-8 text-sm text-muted-foreground shadow-sm">
        No tasks yet. Create the first task for this workspace using the panel on
        the right.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <article
          key={task.id}
          className="rounded-[24px] border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <TaskStatusBadge status={task.status} />
                <TaskPriorityBadge priority={task.priority} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {task.description ?? "No task description added yet."}
                </p>
                <Link
                  href={getTaskDetailPath(task.id)}
                  className="mt-3 inline-flex text-sm font-medium text-accent transition hover:opacity-80"
                >
                  Open task details
                </Link>
              </div>
            </div>

            <dl className="grid min-w-[240px] gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <dt className="text-muted-foreground">Company</dt>
                <dd className="mt-1 font-medium">
                  {task.company_name ?? "Not linked"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Assignee</dt>
                <dd className="mt-1 font-medium">
                  {task.assignee_name ?? "Unassigned"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Due date</dt>
                <dd className="mt-1 font-medium">
                  {task.due_date ?? "No deadline"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Estimate</dt>
                <dd className="mt-1 font-medium">
                  {task.estimated_minutes} min
                </dd>
              </div>
            </dl>
          </div>
        </article>
      ))}
    </div>
  );
}
