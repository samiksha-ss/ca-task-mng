"use client";

import { useState, useEffect } from "react";
import { createEvent } from "@/lib/queries/events";
import { useRouter } from "next/navigation";
import { Clock, Type, AlignLeft } from "lucide-react";

type EventFormProps = {
  onClose: () => void;
  userId: string;
};

export function EventForm({ onClose, userId }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    const start = new Date().toISOString().slice(0, 16);
    const end = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
    setFormData(prev => ({
      ...prev,
      start_time: start,
      end_time: end
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await createEvent({
        ...formData,
        created_by: userId,
      });

      if (error) throw error;
      
      router.refresh();
      onClose();
    } catch (err) {
      console.error("Failed to create event:", err);
      alert("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
           <Type className="h-3.5 w-3.5" />
           Title
        </label>
        <input
          required
          type="text"
          placeholder="Meeting with client..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-shadow"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
           <AlignLeft className="h-3.5 w-3.5" />
           Description
        </label>
        <textarea
          rows={3}
          placeholder="Agenda items..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-shadow resize-none"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
               <Clock className="h-3.5 w-3.5" />
               Start Time
            </label>
            <input
              required
              type="datetime-local"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-shadow text-sm"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />
         </div>
         <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
               <Clock className="h-3.5 w-3.5" />
               End Time
            </label>
            <input
              required
              type="datetime-local"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-shadow text-sm"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            />
         </div>
      </div>

      <div className="pt-4">
         <button
           disabled={loading}
           type="submit"
           className="w-full py-4 rounded-xl bg-accent text-accent-foreground font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
         >
           {loading ? "Creating..." : "Create Event"}
         </button>
      </div>
    </form>
  );
}
