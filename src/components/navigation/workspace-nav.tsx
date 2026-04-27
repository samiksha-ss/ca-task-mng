"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/lib/permissions/navigation";

type WorkspaceNavProps = {
  items: NavigationItem[];
};

function NavLinks({
  items,
  pathname,
  mobile = false,
  onNavigate,
}: WorkspaceNavProps & {
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className={cn("space-y-1", mobile && "space-y-2")}>
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "block rounded-2xl border px-4 py-3 transition-colors",
              isActive
                ? "border-transparent bg-accent text-accent-foreground"
                : "border-transparent text-foreground hover:border-border hover:bg-background",
            )}
          >
            <div className="text-sm font-medium">{item.label}</div>
            <div
              className={cn(
                "mt-1 text-xs leading-5",
                isActive
                  ? "text-accent-foreground/85"
                  : "text-muted-foreground",
              )}
            >
              {item.description}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

export function WorkspaceNav({ items }: WorkspaceNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <aside className="hidden w-80 shrink-0 rounded-[32px] border border-border bg-card p-5 shadow-sm lg:block">
        <div className="mb-5">
          <p className="text-sm font-medium text-muted-foreground">Workspace</p>
          <h2 className="mt-1 text-xl font-semibold">Navigation</h2>
        </div>
        <NavLinks items={items} pathname={pathname} />
      </aside>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium shadow-sm"
        >
          <Menu className="h-4 w-4" />
          Menu
        </button>
        {isOpen ? (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm">
            <div className="absolute inset-y-0 left-0 w-[86%] max-w-sm border-r border-border bg-card p-5 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Workspace
                  </p>
                  <h2 className="text-xl font-semibold">Navigation</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <NavLinks
                items={items}
                pathname={pathname}
                mobile
                onNavigate={() => setIsOpen(false)}
              />
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
