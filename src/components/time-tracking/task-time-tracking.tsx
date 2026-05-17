"use client";

import { useState } from "react";
import { createTimeEntryAction, deleteTimeEntryAction } from "@/lib/actions/time-entries";
import type { TimeEntry } from "@/services/time-service";
import { Clock, Plus, Trash2, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

type TaskTimeTrackingProps = {
  taskId: string;
  initialEntries: TimeEntry[];
  currentUserId: string;
  estimatedMinutes: number;
};

export function TaskTimeTracking({
  taskId,
  initialEntries,
  currentUserId,
  estimatedMinutes,
}: TaskTimeTrackingProps) {
  const router = useRouter();
  const [showLogForm, setShowLogForm] = useState(false);
  const [minutes, setMinutes] = useState("");
  const [description, setDescription] = useState("");
  const [loggedDate, setLoggedDate] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalMinutes = initialEntries.reduce((sum, entry) => sum + entry.minutes, 0);

  const formatHoursMinutes = (min: number) => {
    const hours = Math.floor(min / 60);
    const remainingMinutes = min % 60;
    if (hours === 0) return `${remainingMinutes}m`;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Progress percentage logic
  const progressPercent = estimatedMinutes > 0 ? Math.min(Math.round((totalMinutes / estimatedMinutes) * 100), 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedMinutes = parseInt(minutes, 10);
    if (isNaN(parsedMinutes) || parsedMinutes <= 0 || submitting) return;

    setSubmitting(true);
    try {
      const { error } = await createTimeEntryAction({
        taskId,
        minutes: parsedMinutes,
        description: description.trim() || undefined,
        loggedDate,
      });

      if (error) {
        alert(error);
      } else {
        setMinutes("");
        setDescription("");
        setLoggedDate(new Date().toISOString().slice(0, 10));
        setShowLogForm(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to log time.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (deletingId || !confirm("Are you sure you want to delete this time log?")) return;

    setDeletingId(entryId);
    try {
      const { error } = await deleteTimeEntryAction({ entryId, taskId });
      if (error) {
        alert(error);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete time log.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-accent" />
          <h3 className="text-xl font-bold tracking-tight">Time Logged</h3>
        </div>
        <button
          onClick={() => setShowLogForm(!showLogForm)}
          className="inline-flex h-9 items-center justify-center rounded-xl bg-accent px-4 text-xs font-bold text-accent-foreground gap-1.5 transition hover:opacity-90 active:scale-95 cursor-pointer shadow"
        >
          <Plus className="h-3.5 w-3.5" /> Log Time
        </button>
      </div>

      {/* Stats and Progress Tracker */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl border border-border/60 bg-background/50">
          <span className="text-xs text-muted-foreground font-semibold">Total Logged</span>
          <p className="text-2xl font-black mt-1 text-foreground">{formatHoursMinutes(totalMinutes)}</p>
        </div>
        <div className="p-4 rounded-2xl border border-border/60 bg-background/50">
          <span className="text-xs text-muted-foreground font-semibold">Budget (Estimated)</span>
          <p className="text-2xl font-black mt-1 text-muted-foreground">
            {estimatedMinutes > 0 ? formatHoursMinutes(estimatedMinutes) : "Not set"}
          </p>
        </div>
      </div>

      {estimatedMinutes > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Progress Against Budget</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Form Overlay/Inline block */}
      {showLogForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl border border-border bg-background/40 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <h4 className="text-sm font-bold">Log Hours</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Logged Minutes</label>
              <input
                required
                type="number"
                min="1"
                placeholder="60 (1 hour)"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-accent"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Log Date</label>
              <input
                required
                type="date"
                value={loggedDate}
                onChange={(e) => setLoggedDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description / Notes</label>
            <input
              type="text"
              placeholder="What did you work on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-accent"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowLogForm(false)}
              className="h-9 px-4 rounded-xl border border-border text-xs font-semibold hover:bg-muted cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-9 px-4 rounded-xl bg-accent text-accent-foreground text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              Save Log
            </button>
          </div>
        </form>
      )}

      {/* Logged List */}
      {initialEntries.length === 0 ? (
        <p className="text-xs text-muted-foreground p-3 text-center border border-dashed border-border/60 rounded-xl">
          No time logged on this task yet.
        </p>
      ) : (
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
          {initialEntries.map((entry) => {
            const isOwner = entry.user_id === currentUserId;
            return (
              <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-background/25 border border-border/40 hover:bg-background/50 transition-colors group">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold bg-accent/10 px-2 py-0.5 rounded text-accent">
                      {formatHoursMinutes(entry.minutes)}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(entry.logged_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-foreground truncate">{entry.user_name}</p>
                  {entry.description && (
                    <p className="text-xs text-muted-foreground leading-normal break-words">{entry.description}</p>
                  )}
                </div>
                {isOwner && (
                  <button
                    disabled={deletingId === entry.id}
                    onClick={() => handleDelete(entry.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center shrink-0 text-muted-foreground cursor-pointer"
                    title="Delete Time Log"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
