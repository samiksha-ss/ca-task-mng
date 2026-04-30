import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  icon?: ReactNode;

  // dashboard usage
  trend?: string;
  trendUp?: boolean;

  // backward compatibility (admin pages etc.)
  // Hint (for admin / older pages)
  hint?: string;
  href?: string;
  onClick?: () => void;
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  hint,
  href,
  onClick,
}: StatCardProps) {
  const content = (
    <div 
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between transition-all h-full",
        (onClick || href) && "cursor-pointer hover:border-accent/40 active:scale-[0.98]"
      )}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>

      {/* Value + trend */}
      <div className="mt-4 flex flex-wrap items-baseline gap-3">
        <p className="text-3xl font-semibold tracking-tight">{value}</p>

        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-md",
              trendUp
                ? "text-green-700 bg-green-500/10 dark:text-green-400"
                : "text-amber-700 bg-amber-500/10 dark:text-amber-400"
            )}
          >
            {trend}
          </span>
        )}
      </div>

      {/* Hint (for admin / older pages) */}
      {hint && (
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}