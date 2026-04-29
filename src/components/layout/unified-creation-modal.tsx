"use client";

import { useState } from "react";
import { X, ListTodo, Calendar as CalendarIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateTaskForm } from "@/features/tasks/components/create-task-form";
import { EventForm } from "@/components/calendar/event-form";
import type { Company, Profile, Team } from "@/types";

type UnifiedCreationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  // Directory data for the task form
  teams: Team[];
  companies: Company[];
  assignees: Profile[];
};

export function UnifiedCreationModal({ 
  isOpen, 
  onClose, 
  userId,
  teams,
  companies,
  assignees
}: UnifiedCreationModalProps) {
  const [activeTab, setActiveTab] = useState<"task" | "event">("task");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-2xl bg-card rounded-[32px] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/20">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Create New</h3>
            <p className="text-sm text-muted-foreground mt-1">Add a new task or event to your workspace.</p>
          </div>
          <button 
            onClick={onClose}
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors border border-border bg-background"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs / Switch */}
        <div className="px-8 pt-6">
           <div className="flex p-1 bg-muted rounded-2xl w-full sm:w-fit gap-1">
              <button 
                onClick={() => setActiveTab("task")}
                className={cn(
                  "flex-1 sm:w-32 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                  activeTab === "task" ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ListTodo className="h-4 w-4" />
                Task
              </button>
              <button 
                onClick={() => setActiveTab("event")}
                className={cn(
                  "flex-1 sm:w-32 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                  activeTab === "event" ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                Event
              </button>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 pt-6 custom-scrollbar">
          {activeTab === "task" ? (
             <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <CreateTaskForm 
                   teams={teams}
                   companies={companies}
                   assignees={assignees}
                   canChooseTeam={true}
                   canChooseAssignee={true}
                />
             </div>
          ) : (
             <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <EventForm 
                  userId={userId} 
                  onClose={onClose} 
                />
             </div>
          )}
        </div>
        
        {/* Footer info or actions could go here */}
        <div className="px-8 py-4 bg-muted/10 border-t border-border flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
           <span>CA Task Manager System v1.0</span>
           <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>System Online</span>
           </div>
        </div>
      </div>
    </div>
  );
}
