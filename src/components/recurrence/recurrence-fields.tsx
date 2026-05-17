"use client";

import { Calendar, RefreshCw } from "lucide-react";
import { 
  type RecurrenceRule, 
  type RecurrenceIntervalType, 
  getRecurrenceSummary 
} from "@/lib/utils/recurrence";
import { cn } from "@/lib/utils";

type RecurrenceFieldsProps = {
  enabled: boolean;
  onChangeEnabled: (enabled: boolean) => void;
  rule: RecurrenceRule;
  onChangeRule: (rule: RecurrenceRule) => void;
};

const WEEKDAYS = [
  { label: "S", value: "SU" },
  { label: "M", value: "MO" },
  { label: "T", value: "TU" },
  { label: "W", value: "WE" },
  { label: "T", value: "TH" },
  { label: "F", value: "FR" },
  { label: "S", value: "SA" },
];

export function RecurrenceFields({
  enabled,
  onChangeEnabled,
  rule,
  onChangeRule,
}: RecurrenceFieldsProps) {
  // Derived state directly from props to prevent cascading render cycles
  const selectedDays = rule.weekdays ? rule.weekdays.split(",").map(s => s.trim()).filter(Boolean) : [];

  const updateRule = (updates: Partial<RecurrenceRule>) => {
    onChangeRule({
      ...rule,
      ...updates,
    });
  };

  const handleDayToggle = (day: string) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    
    updateRule({ weekdays: newDays.length > 0 ? newDays.join(",") : null });
  };

  const getIntervalLabel = () => {
    switch (rule.intervalType) {
      case "daily": return rule.intervalCount > 1 ? "days" : "day";
      case "weekly": return rule.intervalCount > 1 ? "weeks" : "week";
      case "monthly": return rule.intervalCount > 1 ? "months" : "month";
      case "yearly": return rule.intervalCount > 1 ? "years" : "year";
      default: return "";
    }
  };

  const summary = getRecurrenceSummary(rule);

  return (
    <div className="space-y-4 border border-border bg-muted/10 p-5 rounded-2xl transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <RefreshCw className={cn("h-4.5 w-4.5 text-muted-foreground", enabled && "animate-spin text-accent")} />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">Recurring Schedule</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">Automate creations on a custom frequency.</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={enabled} 
            onChange={(e) => onChangeEnabled(e.target.checked)} 
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
        </label>
      </div>

      {enabled && (
        <div className="space-y-5 pt-3 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Frequency & Multiplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Frequency</label>
              <select
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-background outline-none focus:ring-1 focus:ring-accent"
                value={rule.intervalType}
                onChange={(e) => {
                  const type = e.target.value as RecurrenceIntervalType;
                  updateRule({ 
                    intervalType: type,
                    // If switching to weekly and no weekdays selected, default to today
                    weekdays: type === "weekly" && selectedDays.length === 0 
                      ? [["SU", "MO", "TU", "WE", "TH", "FR", "SA"][new Date().getDay()]].join(",")
                      : rule.weekdays
                  });
                }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Repeat Every
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  className="w-20 px-4 py-2 text-sm rounded-xl border border-border bg-background outline-none text-center focus:ring-1 focus:ring-accent"
                  value={rule.intervalCount}
                  onChange={(e) => updateRule({ intervalCount: Math.max(1, parseInt(e.target.value) || 1) })}
                />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {getIntervalLabel()}
                </span>
              </div>
            </div>
          </div>

          {/* Weekday Selector (Weekly only) */}
          {rule.intervalType === "weekly" && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Repeat On</label>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((day) => {
                  const isSelected = selectedDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      className={cn(
                        "h-9 w-9 text-xs font-bold rounded-lg border border-border transition-all flex items-center justify-center cursor-pointer",
                        isSelected 
                          ? "bg-accent text-accent-foreground border-accent shadow-sm" 
                          : "bg-background text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* End Condition Controls */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">End Recurrence</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => updateRule({ endType: "never" })}
                className={cn(
                  "py-2 text-xs font-bold rounded-xl border border-border transition-all cursor-pointer",
                  rule.endType === "never" 
                    ? "bg-accent/10 border-accent/30 text-accent" 
                    : "bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                Never
              </button>
              <button
                type="button"
                onClick={() => updateRule({ endType: "date", endDate: rule.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] })}
                className={cn(
                  "py-2 text-xs font-bold rounded-xl border border-border transition-all cursor-pointer",
                  rule.endType === "date" 
                    ? "bg-accent/10 border-accent/30 text-accent" 
                    : "bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                On Date
              </button>
              <button
                type="button"
                onClick={() => updateRule({ endType: "count", endCount: rule.endCount || 10 })}
                className={cn(
                  "py-2 text-xs font-bold rounded-xl border border-border transition-all cursor-pointer",
                  rule.endType === "count" 
                    ? "bg-accent/10 border-accent/30 text-accent" 
                    : "bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                After Count
              </button>
            </div>

            {/* Dynamic End Value Inputs */}
            {rule.endType === "date" && (
              <div className="pt-2 animate-in fade-in duration-200">
                <input
                  type="date"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-border bg-background outline-none focus:ring-1 focus:ring-accent"
                  value={rule.endDate ? String(rule.endDate).split("T")[0] : ""}
                  onChange={(e) => updateRule({ endDate: e.target.value })}
                />
              </div>
            )}

            {rule.endType === "count" && (
              <div className="flex items-center gap-3 pt-2 animate-in fade-in duration-200">
                <input
                  type="number"
                  min={1}
                  className="w-24 px-4 py-2 text-sm rounded-xl border border-border bg-background outline-none text-center focus:ring-1 focus:ring-accent"
                  value={rule.endCount || 1}
                  onChange={(e) => updateRule({ endCount: Math.max(1, parseInt(e.target.value) || 1) })}
                />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Occurrences</span>
              </div>
            )}
          </div>

          {/* Premium Preview Box */}
          <div className="bg-accent/[0.03] border border-accent/10 p-4 rounded-xl flex items-start gap-3">
            <Calendar className="h-4.5 w-4.5 text-accent mt-0.5" />
            <div className="flex-1">
              <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Recurrence Rule Summary</span>
              <p className="text-xs font-semibold text-foreground/80 mt-0.5 leading-relaxed">
                {summary}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
