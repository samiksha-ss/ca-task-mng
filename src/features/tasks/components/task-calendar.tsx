import Link from "next/link";
import { getTaskDetailPath } from "@/lib/constants/routes";
import type { Task } from "@/types";
import { TaskPriorityBadge } from "./task-priority-badge";
import { TaskStatusBadge } from "./task-status-badge";

type CalendarCell = {
  date: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  tasks: Task[];
};

type TaskCalendarProps = {
  tasks: Task[];
  monthDate?: Date;
};

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildCalendarCells(tasks: Task[], monthDate: Date): CalendarCell[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const startOffset = firstOfMonth.getUTCDay();
  const gridStart = new Date(firstOfMonth);
  gridStart.setUTCDate(firstOfMonth.getUTCDate() - startOffset);

  const tasksByDate = new Map<string, Task[]>();

  for (const task of tasks) {
    if (!task.due_date) {
      continue;
    }

    const current = tasksByDate.get(task.due_date) ?? [];
    current.push(task);
    tasksByDate.set(task.due_date, current);
  }

  return Array.from({ length: 42 }, (_, index) => {
    const cellDate = new Date(gridStart);
    cellDate.setUTCDate(gridStart.getUTCDate() + index);
    const dateKey = toDateKey(cellDate);

    return {
      date: dateKey,
      dayNumber: cellDate.getUTCDate(),
      inCurrentMonth: cellDate.getUTCMonth() === month,
      tasks: tasksByDate.get(dateKey) ?? [],
    };
  });
}

export function TaskCalendar({
  tasks,
  monthDate = new Date(),
}: TaskCalendarProps) {
  const cells = buildCalendarCells(tasks, monthDate);
  const undatedTasks = tasks.filter((task) => !task.due_date);
  const monthLabel = formatMonthLabel(monthDate);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Due date calendar
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">{monthLabel}</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            This view maps visible tasks onto the current month using each task&apos;s
            due date, so teams can spot deadline clusters early.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="rounded-2xl px-2 py-3">
              {day}
            </div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-7">
          {cells.map((cell) => (
            <section
              key={cell.date}
              className={[
                "min-h-[150px] rounded-[24px] border p-3 shadow-sm",
                cell.inCurrentMonth
                  ? "border-border bg-background"
                  : "border-border/70 bg-muted/30 text-muted-foreground",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{cell.dayNumber}</p>
                {cell.tasks.length > 0 ? (
                  <span className="rounded-full bg-accent/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-accent">
                    {cell.tasks.length}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 space-y-2">
                {cell.tasks.slice(0, 3).map((task) => (
                  <Link
                    key={task.id}
                    href={getTaskDetailPath(task.id)}
                    className="block rounded-2xl border border-border bg-card px-3 py-2 text-left transition hover:border-accent"
                  >
                    <p className="text-sm font-medium leading-5">{task.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {task.assignee_name ?? "Unassigned"}
                    </p>
                  </Link>
                ))}
                {cell.tasks.length > 3 ? (
                  <p className="text-xs text-muted-foreground">
                    +{cell.tasks.length - 3} more tasks
                  </p>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Upcoming due work
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Task agenda
            </h2>
          </div>

          <div className="mt-6 space-y-4">
            {tasks.filter((task) => Boolean(task.due_date)).length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">
                No tasks with due dates are visible in your current scope yet.
              </div>
            ) : (
              tasks
                .filter((task) => Boolean(task.due_date))
                .sort((left, right) => (left.due_date ?? "").localeCompare(right.due_date ?? ""))
                .slice(0, 10)
                .map((task) => (
                  <article
                    key={task.id}
                    className="rounded-[24px] border border-border bg-background p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <TaskStatusBadge status={task.status} />
                      <TaskPriorityBadge priority={task.priority} />
                    </div>
                    <h3 className="mt-3 text-lg font-semibold">{task.title}</h3>
                    <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                      <div>
                        <dt className="text-muted-foreground">Due</dt>
                        <dd className="mt-1 font-medium">{task.due_date}</dd>
                      </div>
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
                    </dl>
                  </article>
                ))
            )}
          </div>
        </section>

        <aside className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Missing due dates
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Undated tasks
            </h2>
          </div>

          <div className="mt-6 space-y-4">
            {undatedTasks.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">
                Every visible task already has a due date.
              </div>
            ) : (
              undatedTasks.map((task) => (
                <Link
                  key={task.id}
                  href={getTaskDetailPath(task.id)}
                  className="block rounded-[24px] border border-border bg-background p-4 transition hover:border-accent"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <TaskStatusBadge status={task.status} />
                    <TaskPriorityBadge priority={task.priority} />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{task.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {task.assignee_name ?? "Unassigned"}
                  </p>
                </Link>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
