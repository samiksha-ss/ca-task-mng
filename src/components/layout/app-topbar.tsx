import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { signOutAction } from "@/features/auth/actions";
import { ROLE_LABELS } from "@/lib/constants/app";
import {
  APP_HOME_PATH,
  NOTIFICATIONS_PATH,
  TASKS_PATH,
} from "@/lib/constants/routes";
import type { CurrentUserContext } from "@/types/auth";

type AppTopbarProps = {
  context: CurrentUserContext | null;
};

export function AppTopbar({ context }: AppTopbarProps) {
  const profile = context?.profile ?? null;

  return (
    <header className="rounded-[28px] border border-border bg-card/80 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            CA Task Manager
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {profile?.full_name ?? "Protected workspace"}
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            Search, filters, and command menu coming next
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={TASKS_PATH}
              className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground"
            >
              New task area
            </Link>
            <Link
              href={NOTIFICATIONS_PATH}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background"
            >
              <Bell className="h-4 w-4" />
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-4 text-sm font-medium"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <span>{profile?.email ?? "No active profile yet"}</span>
          <span className="hidden sm:inline">•</span>
          <span>{profile ? ROLE_LABELS[profile.role] : "Unassigned role"}</span>
        </div>
        <Link href={APP_HOME_PATH} className="font-medium text-foreground">
          Back to overview
        </Link>
      </div>
    </header>
  );
}
