import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function DashboardCard({ title, description, action, children, className = "" }: DashboardCardProps) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col h-full", className)}>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
