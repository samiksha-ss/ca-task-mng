"use client";

import { useState } from "react";
import { X, Calendar, ArrowRight, Trash2, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

type RecurrenceEditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scope: "one" | "future" | "all") => void;
  actionType: "edit" | "delete";
  itemName?: string;
};

export function RecurrenceEditModal({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  itemName = "item",
}: RecurrenceEditModalProps) {
  const [selectedScope, setSelectedScope] = useState<"one" | "future" | "all">("one");

  if (!isOpen) return null;

  const isEdit = actionType === "edit";

  const options = [
    {
      value: "one" as const,
      title: isEdit ? "This occurrence only" : "Delete this occurrence",
      description: isEdit 
        ? "Only updates this single occurrence. Other occurrences in the series remain linked."
        : "Only removes this single occurrence. Other occurrences in the series will be kept.",
      icon: Calendar,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      value: "future" as const,
      title: isEdit ? "This and future occurrences" : "Delete this and future occurrences",
      description: isEdit
        ? "Splits the series. Updates this occurrence and all future ones. Past history is preserved."
        : "Removes this occurrence and all future occurrences. Past history is preserved.",
      icon: ArrowRight,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      value: "all" as const,
      title: isEdit ? "Entire series" : "Delete entire series",
      description: isEdit
        ? "Updates the entire recurring series, including past occurrences."
        : "Removes the entire recurring series completely.",
      icon: isEdit ? CalendarDays : Trash2,
      color: isEdit ? "text-purple-500 bg-purple-500/10 border-purple-500/20" : "text-rose-500 bg-rose-500/10 border-rose-500/20",
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-card rounded-[32px] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div>
            <h3 className="text-lg font-bold tracking-tight">
              {isEdit ? "Update Recurring Series" : "Delete Recurring Series"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select the scope of this {actionType} for: <strong className="text-foreground font-bold">&quot;{itemName}&quot;</strong>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors border border-border bg-background"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Options */}
        <div className="p-6 space-y-3">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isChecked = selectedScope === opt.value;
            
            return (
              <div 
                key={opt.value}
                onClick={() => setSelectedScope(opt.value)}
                className={cn(
                  "p-4 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer select-none",
                  isChecked 
                    ? "bg-accent/[0.04] border-accent shadow-sm" 
                    : "border-border hover:border-border/80 hover:bg-muted/30"
                )}
              >
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border", opt.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-foreground flex items-center justify-between">
                    {opt.title}
                    <div className={cn(
                      "h-4 w-4 rounded-full border flex items-center justify-center transition-all",
                      isChecked ? "border-accent bg-accent" : "border-muted"
                    )}>
                      {isChecked && <div className="h-1.5 w-1.5 rounded-full bg-accent-foreground" />}
                    </div>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-normal">
                    {opt.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-muted/20 border-t border-border flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-border bg-background hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(selectedScope)}
            className={cn(
              "px-5 py-2 text-xs font-bold rounded-xl text-white shadow-lg active:scale-95 transition-all",
              isEdit ? "bg-accent text-accent-foreground" : "bg-red-500 hover:bg-red-600"
            )}
          >
            {isEdit ? "Confirm Edit" : "Confirm Delete"}
          </button>
        </div>

      </div>
    </div>
  );
}
