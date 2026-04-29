import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  trendUp?: boolean;
};

export function StatCard({ title, value, icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="mt-4 flex flex-wrap items-baseline gap-3">
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-md", 
            trendUp ? "text-green-700 bg-green-500/10 dark:text-green-400" : "text-amber-700 bg-amber-500/10 dark:text-amber-400"
          )}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
