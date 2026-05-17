/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { 
  createEventAction as createEvent, 
  updateEventAction as updateEvent, 
  deleteEventAction as deleteEvent 
} from "@/lib/actions/events";
import { useRouter } from "next/navigation";
import { Clock, Type, AlignLeft, Trash2, CalendarDays, AlertTriangle } from "lucide-react";
import type { Event } from "@/types";
import { RecurrenceFields } from "../recurrence/recurrence-fields";
import { RecurrenceEditModal } from "../recurrence/recurrence-edit-modal";
import type { RecurrenceRule, RecurrenceIntervalType, RecurrenceEndType } from "@/lib/utils/recurrence";

type EventFormProps = {
  onClose: () => void;
  userId: string;
  event?: Event | null;
};

export function EventForm({ onClose, userId, event = null }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const isEdit = Boolean(event);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });

  const [recurrenceEnabled, setRecurrenceEnabled] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>({
    intervalType: "none",
    intervalCount: 1,
    weekdays: null,
    endType: "never",
    endDate: null,
    endCount: null,
  });

  // Series selection modals
  const [showEditScopeModal, setShowEditScopeModal] = useState(false);
  const [showDeleteScopeModal, setShowDeleteScopeModal] = useState(false);

  useEffect(() => {
    if (event) {
      // Map existing event properties
      const startLocal = new Date(event.start_time).toISOString().slice(0, 16);
      const endLocal = new Date(event.end_time).toISOString().slice(0, 16);
      
      setFormData({
        title: event.title,
        description: event.description || "",
        startTime: startLocal,
        endTime: endLocal,
      });

      const hasRecurrence = event.recurrence_interval_type !== "none" && event.recurrence_interval_type !== null;
      setRecurrenceEnabled(hasRecurrence);
      
      if (hasRecurrence) {
        setRecurrenceRule({
          intervalType: (event.recurrence_interval_type as any) || "none",
          intervalCount: event.recurrence_interval_count ?? 1,
          weekdays: event.recurrence_weekdays ?? null,
          endType: (event.recurrence_end_type as any) || "never",
          endDate: event.recurrence_end_date ? new Date(event.recurrence_end_date).toISOString().split('T')[0] : null,
          endCount: event.recurrence_end_count ?? null,
        });
      }
    } else {
      // Default to 1-hour meetings starting now
      const start = new Date().toISOString().slice(0, 16);
      const end = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
      setFormData({
        title: "",
        description: "",
        startTime: start,
        endTime: end
      });
    }
  }, [event]);

  // Main Submit handler (Create or intercepts Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(formData.endTime) < new Date(formData.startTime)) {
      alert("End time cannot be earlier than start time.");
      return;
    }

    if (isEdit) {
      const isRecurringEvent = event?.recurrence_parent_id || (event?.recurrence_interval_type && event?.recurrence_interval_type !== "none");
      if (isRecurringEvent) {
        // Show series edit choice modal
        setShowEditScopeModal(true);
      } else {
        // Normal non-recurring edit
        await executeUpdate("one");
      }
    } else {
      // Create mode
      await executeCreate();
    }
  };

  const executeCreate = async () => {
    setLoading(true);
    try {
      const { error } = await createEvent(
        formData,
        recurrenceEnabled ? recurrenceRule : { intervalType: "none", intervalCount: 1, endType: "never" }
      );

      if (error) throw new Error(error);
      
      router.refresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to create event:", err);
      alert(err.message || "Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const executeUpdate = async (scope: "one" | "future" | "all") => {
    if (!event) return;
    setLoading(true);
    
    try {
      const { error } = await updateEvent(
        event.id,
        formData,
        scope,
        recurrenceEnabled ? recurrenceRule : { intervalType: "none", intervalCount: 1, endType: "never" },
        event.recurrence_instance_date || event.start_time.split("T")[0]
      );

      if (error) throw new Error(error);

      router.refresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to update event:", err);
      alert(err.message || "Failed to update event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async (scope: "one" | "future" | "all") => {
    if (!event) return;
    setLoading(true);

    try {
      const { error } = await deleteEvent(
        event.id,
        scope,
        event.recurrence_instance_date || event.start_time.split("T")[0]
      );

      if (error) throw new Error(error);

      router.refresh();
      onClose();
    } catch (err: any) {
      console.error("Failed to delete event:", err);
      alert(err.message || "Failed to delete event.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrigger = () => {
    const isRecurringEvent = event?.recurrence_parent_id || (event?.recurrence_interval_type && event?.recurrence_interval_type !== "none");
    if (isRecurringEvent) {
      setShowDeleteScopeModal(true);
    } else {
      if (confirm("Are you sure you want to delete this event?")) {
        executeDelete("one");
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
             <Type className="h-3.5 w-3.5" />
             Event Title
          </label>
          <input
            required
            type="text"
            placeholder="Meeting with Client..."
            className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-background focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-shadow"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
             <AlignLeft className="h-3.5 w-3.5" />
             Description
          </label>
          <textarea
            rows={3}
            placeholder="Agenda items, dial-in credentials, or link..."
            className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-background focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-shadow resize-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                 <Clock className="h-3.5 w-3.5" />
                 Start Time
              </label>
              <input
                required
                type="datetime-local"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-shadow text-sm"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                 <Clock className="h-3.5 w-3.5" />
                 End Time
              </label>
              <input
                required
                type="datetime-local"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-shadow text-sm"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
           </div>
        </div>

        {/* Reusable Recurrence Picker Fields */}
        <RecurrenceFields
          enabled={recurrenceEnabled}
          onChangeEnabled={setRecurrenceEnabled}
          rule={recurrenceRule}
          onChangeRule={setRecurrenceRule}
        />

        {/* Actions Button */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          {isEdit && (
            <button
              disabled={loading}
              type="button"
              onClick={handleDeleteTrigger}
              className="px-4 py-4 rounded-xl border border-rose-500/30 text-rose-500 bg-rose-500/[0.02] hover:bg-rose-500/10 font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Trash2 className="h-4.5 w-4.5" />
              Delete Event
            </button>
          )}
          
          <button
            disabled={loading}
            type="submit"
            className="flex-1 py-4 rounded-xl bg-accent text-accent-foreground font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : isEdit ? "Save Changes" : "Create Event"}
          </button>
        </div>
      </form>

      {/* Series Choice Modal: EDIT */}
      {showEditScopeModal && (
        <RecurrenceEditModal
          isOpen={showEditScopeModal}
          actionType="edit"
          itemName={formData.title}
          onClose={() => setShowEditScopeModal(false)}
          onConfirm={(scope) => {
            setShowEditScopeModal(false);
            executeUpdate(scope);
          }}
        />
      )}

      {/* Series Choice Modal: DELETE */}
      {showDeleteScopeModal && (
        <RecurrenceEditModal
          isOpen={showDeleteScopeModal}
          actionType="delete"
          itemName={formData.title}
          onClose={() => setShowDeleteScopeModal(false)}
          onConfirm={(scope) => {
            setShowDeleteScopeModal(false);
            executeDelete(scope);
          }}
        />
      )}
    </>
  );
}
