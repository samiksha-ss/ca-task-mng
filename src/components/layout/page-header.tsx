import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;

  // new optional props
  icon?: ReactNode;
  tone?: "default" | "info" | "success" | "warning" | "danger";
  compact?: boolean;
  backHref?: string;
  backLabel?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  icon,
  tone = "default",
  compact,
  backHref,
  backLabel,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-[28px] border p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between",
        tone === "default" && "border-border bg-card",
        tone === "info" && "border-blue-200 bg-blue-50 dark:bg-blue-950/20",
        tone === "success" && "border-green-200 bg-green-50 dark:bg-green-950/20",
        tone === "warning" && "border-amber-200 bg-amber-50 dark:bg-amber-950/20",
        tone === "danger" && "border-red-200 bg-red-50 dark:bg-red-950/20",
        compact ? "p-4 gap-3" : "p-6 gap-4"
      )}
    >
      <div className="flex flex-col gap-4">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel ?? "Back"}
          </Link>
        )}

        <div className="space-y-2">
        {eyebrow && (
          <p className="text-sm font-medium text-muted-foreground">
            {eyebrow}
          </p>
        )}

        <div className="flex items-center gap-2">
          {icon && <div className="text-muted-foreground">{icon}</div>}
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        </div>

        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>

      </div>
      {action && <div>{action}</div>}
    </div>
  );
}