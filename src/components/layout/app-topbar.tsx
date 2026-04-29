"use client";

import { Search, User } from "lucide-react";
import { signOutAction } from "@/features/auth/actions";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { CurrentUserContext } from "@/types/auth";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TASKS_PATH } from "@/lib/constants/routes";

type AppTopbarProps = {
  context: CurrentUserContext | null;
};

export function AppTopbar({ context }: AppTopbarProps) {
  const profile = context?.profile ?? null;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue) {
        router.push(`${TASKS_PATH}?search=${encodeURIComponent(searchValue)}`);
      } else if (searchParams.get("search")) {
        router.push(TASKS_PATH);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchValue, router, searchParams]);

  return (
    <header className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {profile?.role === "admin" ? "Admin Workspace" : "Dashboard"}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {profile?.full_name?.split(' ')[0] ?? "User"}
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground w-full sm:w-64 focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-shadow">
            <Search className="h-4 w-4 shrink-0" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Profile Dropdown */}
            <div className="relative group">
               <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background transition hover:bg-muted focus:outline-none">
                 <User className="h-4 w-4" />
               </button>
               {/* Simple dropdown menu on hover */}
               <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="px-4 py-3 border-b border-border mb-1">
                    <p className="font-medium text-foreground truncate text-sm">{profile?.full_name ?? "User"}</p>
                    <p className="text-muted-foreground text-xs truncate mt-0.5">{profile?.email}</p>
                  </div>
                  <div className="p-1">
                    <form action={signOutAction}>
                      <button
                        type="submit"
                        className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition"
                      >
                        Sign out
                      </button>
                    </form>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
