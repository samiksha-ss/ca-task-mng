"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { updateTaskStatusAction } from "../actions";
import { getTaskDetailPath } from "@/lib/constants/routes";
import type { Task, TaskStatus } from "@/types";
import { cn } from "@/lib/utils";

type TaskCardInteractiveProps = {
  task: Task;
  children: React.ReactNode;
  className?: string;
  showDoneButton?: boolean;
};

export function TaskCardInteractive({ 
  task, 
  children, 
  className,
  showDoneButton = true 
}: TaskCardInteractiveProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [isUpdating, setIsUpdating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleCardClick = () => {
    router.push(getTaskDetailPath(task.id));
  };

  const handleStatusUpdate = async (e: React.MouseEvent, status: TaskStatus) => {
    e.stopPropagation();
    setMenuOpen(false);
    setIsUpdating(true);
    await updateTaskStatusAction(task.id, status);
    router.refresh();
    setIsUpdating(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <article
      onClick={handleCardClick}
      onContextMenu={handleContextMenu}
      className={cn(
        "group relative transition-all cursor-pointer",
        isUpdating && "opacity-50 pointer-events-none",
        className
      )}
    >
      {children}
      
      {showDoneButton && task.status !== "done" && (
        <button
          onClick={(e) => handleStatusUpdate(e, "done")}
          className="absolute top-4 right-4 h-8 w-8 rounded-full border border-border bg-background flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all shadow-sm"
          title="Mark as done"
        >
          <Check className="h-4 w-4 text-emerald-600" />
        </button>
      )}

      {menuOpen && (
        <div
          ref={menuRef}
          style={{ 
            top: menuPos.y, 
            left: menuPos.x,
            transform: 'translate(-50%, -10px)'
          }}
          className="fixed z-50 min-w-[160px] rounded-2xl border border-border bg-card p-1.5 shadow-2xl animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Change Status
          </div>
          {(["todo", "in_progress", "done"] as TaskStatus[]).map((status) => (
            <button
              key={status}
              onClick={(e) => handleStatusUpdate(e, status)}
              className={cn(
                "w-full rounded-xl px-3 py-2 text-left text-sm transition-colors",
                task.status === status ? "bg-accent/10 text-accent font-medium" : "hover:bg-muted"
              )}
            >
              {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
