import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  footer?: ReactNode;
  children: ReactNode;
};

export function AuthCard({
  title,
  description,
  footer,
  children,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-md rounded-[28px] border border-border bg-card p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="mt-8">{children}</div>
      {footer ? <div className="mt-6">{footer}</div> : null}
    </div>
  );
}
