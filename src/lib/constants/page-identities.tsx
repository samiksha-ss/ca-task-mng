import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  CalendarDays,
  ChartColumn,
  LayoutDashboard,
  LayoutList,
  Settings,
  ShieldCheck,
  SquareKanban,
  Users,
  UsersRound,
} from "lucide-react";
import type { PageHeaderTone } from "@/components/layout/page-header";

export type PageIdentity = {
  eyebrow: string;
  icon: LucideIcon;
  tone: PageHeaderTone;
};

export const pageIdentities = {
  dashboard: {
    eyebrow: "Overview",
    icon: LayoutDashboard,
    tone: "dashboard",
  },
  tasks: {
    eyebrow: "Task workspace",
    icon: LayoutList,
    tone: "tasks",
  },
  board: {
    eyebrow: "Workflow view",
    icon: SquareKanban,
    tone: "board",
  },
  calendar: {
    eyebrow: "Scheduling view",
    icon: CalendarDays,
    tone: "calendar",
  },
  companies: {
    eyebrow: "Client records",
    icon: Building2,
    tone: "companies",
  },
  teams: {
    eyebrow: "Team structure",
    icon: UsersRound,
    tone: "teams",
  },
  members: {
    eyebrow: "People",
    icon: Users,
    tone: "members",
  },
  analytics: {
    eyebrow: "Insights",
    icon: ChartColumn,
    tone: "analytics",
  },
  notifications: {
    eyebrow: "Alerts",
    icon: Bell,
    tone: "notifications",
  },
  settings: {
    eyebrow: "Configuration",
    icon: Settings,
    tone: "settings",
  },
  admin: {
    eyebrow: "Admin tools",
    icon: ShieldCheck,
    tone: "admin",
  },
} satisfies Record<string, PageIdentity>;
