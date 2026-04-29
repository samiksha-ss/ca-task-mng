import { APP_HOME_PATH } from "@/lib/constants/routes";
import type { AppRole } from "@/types";

export type NavigationItem = {
  href: string;
  label: string;
  description: string;
  roles: AppRole[];
  icon: string;
};

export const navigationItems: NavigationItem[] = [
  {
    href: APP_HOME_PATH,
    label: "Dashboard",
    description: "Overview and personal metrics",
    roles: ["admin", "manager", "member"],
    icon: "LayoutDashboard",
  },
  {
    href: "/tasks",
    label: "Tasks",
    description: "List and create work items",
    roles: ["admin", "manager", "member"],
    icon: "ListTodo",
  },
  {
    href: "/board",
    label: "Board",
    description: "Kanban workflow view",
    roles: ["admin", "manager", "member"],
    icon: "Kanban",
  },
  {
    href: "/calendar",
    label: "Calendar",
    description: "Deadline and scheduling view",
    roles: ["admin", "manager", "member"],
    icon: "Calendar",
  },
  {
    href: "/companies",
    label: "Companies",
    description: "Client company records",
    roles: ["admin", "manager", "member"],
    icon: "Building2",
  },
  {
    href: "/teams",
    label: "Teams",
    description: "Team structure and ownership",
    roles: ["admin", "manager"],
    icon: "Users",
  },
  {
    href: "/members",
    label: "Members",
    description: "People and assignment visibility",
    roles: ["admin", "manager"],
    icon: "UserCircle",
  },
  {
    href: "/analytics",
    label: "Analytics",
    description: "Role-based reporting",
    roles: ["admin", "manager", "member"],
    icon: "BarChart3",
  },
  {
    href: "/notifications",
    label: "Notifications",
    description: "Alerts and updates",
    roles: ["admin", "manager", "member"],
    icon: "Bell",
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Workspace and account settings",
    roles: ["admin", "manager", "member"],
    icon: "Settings",
  },
  {
    href: "/admin/users",
    label: "Admin",
    description: "Company-wide management",
    roles: ["admin"],
    icon: "ShieldCheck",
  },
];

export function getNavigationForRole(role: AppRole | null | undefined) {
  if (!role) {
    return navigationItems.filter((item) => item.href === APP_HOME_PATH);
  }

  return navigationItems.filter((item) => item.roles.includes(role));
}
