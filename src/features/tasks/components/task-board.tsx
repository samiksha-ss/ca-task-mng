import Link from "next/link";
import { getTaskDetailPath } from "@/lib/constants/routes";
import type { Task, TaskStatus } from "@/types";
import { TaskPriorityBadge } from "./task-priority-badge";

const boardColumns: Array<{
  status: TaskStatus;
  label: string;
  description: string;
}> = [
  {
    status: "backlog",
    label: "Backlog",
    description: "Ideas and incoming work that still needs scheduling.",
  },
  {
    status: "todo",
    label: "To do",
    description: "Approved work that is ready to be picked up.",
  },
  {
    status: "in_progress",
    label: "In progress",
    description: "Active work that is currently being executed.",
  },
  {
    status: "in_review",
    label: "In review",
    description: "Items awaiting validation or partner review.",
  },
  {
    status: "blocked",
    label: "Blocked",
    description: "Work that cannot move until a dependency is cleared.",
  },
  {
    status: "done",
    label: "Done",
    description: "Completed work closed out by the visible team scope.",
  },
];

type TaskBoardProps = {
  tasks: Task[];
};

export function TaskBoard({ tasks }: TaskBoardProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-6">
      {boardColumns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.status);

        return (
          <section
            key={column.status}
            className="rounded-[28px] border border-border bg-card p-4 shadow-sm"
          >
            <div className="space-y-1 border-b border-border pb-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">{column.label}</h2>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {columnTasks.length}
                </span>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {column.description}
              </p>
            </div>

            <div className="mt-4 space-y-4">
              {columnTasks.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-border bg-background px-4 py-6 text-sm text-muted-foreground">
                  No tasks in this column yet.
                </div>
              ) : (
                columnTasks.map((task) => (
                  <article
                    key={task.id}
                    className="rounded-[22px] border border-border bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold leading-6">
                        {task.title}
                      </h3>
                      <TaskPriorityBadge priority={task.priority} />
                    </div>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {task.description ?? "No task description added yet."}
                    </p>

                    <dl className="mt-4 grid gap-3 text-sm">
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
                    </dl>

                    <Link
                      href={getTaskDetailPath(task.id)}
                      className="mt-4 inline-flex text-sm font-medium text-accent transition hover:opacity-80"
                    >
                      Open task
                    </Link>
                  </article>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
