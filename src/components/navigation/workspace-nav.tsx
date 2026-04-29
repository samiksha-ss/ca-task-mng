"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, X, LayoutDashboard, ListTodo, Kanban, Calendar, 
  Building2, Users, UserCircle, BarChart3, Bell, Settings, 
  ShieldCheck, Plus
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/lib/permissions/navigation";
import { UnifiedCreationModal } from "../layout/unified-creation-modal";
import type { Company, Profile, Team } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  ListTodo,
  Kanban,
  Calendar,
  Building2,
  Users,
  UserCircle,
  BarChart3,
  Bell,
  Settings,
  ShieldCheck
};

type WorkspaceNavProps = {
  items: NavigationItem[];
  userId: string;
  directoryData: {
    teams: Team[];
    companies: Company[];
    assignees: Profile[];
  };
};

function NavLinks({
  items,
  pathname,
  mobile = false,
  onNavigate,
}: {
  items: NavigationItem[];
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className={cn("space-y-1.5", mobile && "space-y-2")}>
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = ICON_MAP[item.icon] || LayoutDashboard;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
              isActive
                ? "bg-accent/10 text-accent font-semibold shadow-sm ring-1 ring-accent/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm"
            )}
          >
            <Icon className={cn(
              "h-5 w-5 shrink-0 transition-colors",
              isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground"
            )} />
            <div className="flex flex-col">
              <span className="text-sm leading-none">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

export function WorkspaceNav({ items, userId, directoryData }: WorkspaceNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <UnifiedCreationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        teams={directoryData.teams}
        companies={directoryData.companies}
        assignees={directoryData.assignees}
      />

      <aside className="hidden w-64 shrink-0 lg:flex flex-col h-full sticky top-4">
        <div className="rounded-[24px] border border-border bg-card p-4 shadow-sm flex flex-col h-full">
           <div className="mb-6 px-2 flex items-center gap-2">
             <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center shadow-sm">
                <ShieldCheck className="h-5 w-5 text-accent-foreground" />
             </div>
             <div>
               <h2 className="text-lg font-bold tracking-tight">CA Manager</h2>
               <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-none">Internal Workspace</p>
             </div>
           </div>

           {/* Primary Action Button */}
           <div className="mb-6 px-1">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-accent text-accent-foreground font-bold shadow-lg hover:shadow-accent/20 hover:opacity-90 active:scale-95 transition-all text-sm"
              >
                <Plus className="h-5 w-5" />
                Create New
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
             <NavLinks items={items} pathname={pathname} />
           </div>
           
           <div className="mt-auto pt-4 border-t border-border/60">
              <Link
                href="/settings"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <Settings className="h-5 w-5" />
                <span className="text-sm font-medium">Settings</span>
              </Link>
           </div>
        </div>
      </aside>

      {/* Mobile Toggle & Sheet */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium shadow-sm active:scale-95 transition-transform"
        >
          <Menu className="h-4 w-4" />
          Menu
        </button>
        {isOpen ? (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm transition-opacity">
            <div className="absolute inset-y-0 left-0 w-[80%] max-w-[300px] border-r border-border bg-card p-5 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2 px-2">
                   <div className="h-7 w-7 rounded bg-accent flex items-center justify-center">
                      <ShieldCheck className="h-4 w-4 text-accent-foreground" />
                   </div>
                   <h2 className="text-lg font-bold">CA Manager</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <button 
                onClick={() => {
                  setIsOpen(false);
                  setIsModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-accent text-accent-foreground font-bold shadow-lg mb-6 text-sm"
              >
                <Plus className="h-5 w-5" />
                Create New
              </button>

              <div className="flex-1 overflow-y-auto">
                <NavLinks
                  items={items}
                  pathname={pathname}
                  mobile
                  onNavigate={() => setIsOpen(false)}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
