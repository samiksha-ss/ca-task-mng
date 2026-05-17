/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, Event } from "@/types";
import { EventForm } from "./event-form";
import { getRecurrenceSummary } from "@/lib/utils/recurrence";

type CalendarViewProps = {
  tasks: Task[];
  events: Event[];
  userId: string;
};

export function CalendarView({ tasks, events, userId }: CalendarViewProps) {
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventEditForm, setShowEventEditForm] = useState(false);
  
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const currentMonthDate = new Date(currentYear, currentMonth, 1);
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long' });

  // Helper to get items for a specific day
  const getItemsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const dayTasks = tasks.filter(t => t.due_date?.split('T')[0] === dateStr);
    const dayEvents = events.filter(e => e.start_time.split('T')[0] === dateStr);
    
    return { tasks: dayTasks, events: dayEvents };
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  if (tasks.length === 0 && events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-card rounded-[32px] border border-border border-dashed">
         <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <CalendarIcon className="h-10 w-10 text-muted-foreground" />
         </div>
         <h3 className="text-2xl font-bold tracking-tight">Your calendar is clear</h3>
         <p className="text-muted-foreground mt-2 max-w-md">No tasks or events have been scheduled for this month yet. Start by creating your first work item or meeting.</p>
         <button 
           onClick={() => setShowEventForm(true)}
           className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-accent px-8 text-sm font-bold text-accent-foreground gap-2 transition hover:opacity-90 shadow-lg active:scale-95"
         >
           <Plus className="h-5 w-5" />
           Create First Event
         </button>
      </div>
    );
  }

  return (
    <>
      {showEventForm && (
        <EventForm 
          userId={userId} 
          onClose={() => setShowEventForm(false)} 
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
           <p className="text-muted-foreground mt-1">Manage scheduled client events and task deadlines.</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setShowEventForm(true)}
             className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-bold text-accent-foreground gap-2 transition hover:opacity-90 shadow-lg active:scale-95"
           >
             <Plus className="h-4 w-4" />
             Create Event
           </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_350px]">
        {/* MONTHLY GRID */}
        <DashboardCard 
          title={`${monthName} ${currentYear}`}
          description="Workspace schedule overview."
          className="min-h-[750px]"
          action={
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
               <button onClick={handlePrevMonth} className="h-8 w-10 rounded-lg hover:bg-background transition-colors flex items-center justify-center cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
               <button onClick={handleGoToToday} className="h-8 px-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-background rounded-lg transition-colors cursor-pointer">Today</button>
               <button onClick={handleNextMonth} className="h-8 w-10 rounded-lg hover:bg-background transition-colors flex items-center justify-center cursor-pointer"><ChevronRight className="h-4 w-4" /></button>
            </div>
          }
        >
          <div className="flex-1 grid grid-cols-7 border-t border-l border-border mt-6">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border-r border-b border-border bg-muted/20">
                {day}
              </div>
            ))}
            
            {/* Padding for first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`pad-${i}`} className="min-h-[120px] border-r border-b border-border bg-muted/5"></div>
            ))}
            
            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const { tasks: dayTasks, events: dayEvents } = getItemsForDay(day);
              const isToday = day === now.getDate();
              
              return (
                <div key={day} className={cn(
                  "min-h-[140px] p-2 border-r border-b border-border transition-all hover:bg-accent/[0.02] flex flex-col group",
                  isToday && "bg-accent/[0.04]"
                )}>
                  <div className="flex items-start justify-between mb-2">
                     <span className={cn(
                       "text-sm font-bold h-7 w-7 flex items-center justify-center rounded-lg transition-all",
                       isToday ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground group-hover:text-foreground"
                     )}>
                       {day}
                     </span>
                     {(dayTasks.length > 0 || dayEvents.length > 0) && (
                        <div className="flex gap-1">
                           {dayTasks.length > 0 && <div className="h-1.5 w-1.5 rounded-full bg-accent" />}
                           {dayEvents.length > 0 && <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />}
                        </div>
                     )}
                  </div>
                  
                  <div className="space-y-1.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {dayEvents.map(event => (
                      <div 
                        key={event.id} 
                        onClick={() => setSelectedEvent(event)}
                        className="px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-600 dark:text-purple-400 truncate cursor-pointer hover:bg-purple-500/20 transition-colors flex items-center gap-1.5"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                        {event.title}
                      </div>
                    ))}
                    {dayTasks.map(task => (
                      <div key={task.id} className="px-2 py-1 rounded-lg bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent truncate cursor-pointer hover:bg-accent/20 transition-colors flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                        {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {/* Trailing padding to complete the grid */}
            {Array.from({ length: 42 - (daysInMonth + firstDayOfMonth) }).map((_, i) => (
              <div key={`pad-end-${i}`} className="min-h-[120px] border-r border-b border-border bg-muted/5"></div>
            ))}
          </div>
        </DashboardCard>

        {/* SIDE PANEL */}
        <div className="space-y-6">
           <DashboardCard title="Upcoming Events">
              <div className="space-y-4">
                 {events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-2xl bg-muted/20">
                       <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No Events</p>
                    </div>
                 ) : (
                    events.slice(0, 5).map(event => (
                       <div 
                          key={event.id} 
                          onClick={() => setSelectedEvent(event)}
                          className="flex gap-4 p-3 rounded-2xl border border-transparent hover:border-border hover:bg-muted/30 transition-all group cursor-pointer"
                       >
                          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col items-center justify-center shrink-0">
                             <span className="text-[10px] font-bold text-purple-600 uppercase">{new Date(event.start_time).toLocaleString('default', { month: 'short' })}</span>
                             <span className="text-sm font-bold text-purple-700 dark:text-purple-400 leading-none">{new Date(event.start_time).getDate()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                             <h4 className="text-sm font-bold truncate">{event.title}</h4>
                             <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                <Clock className="h-3 w-3" />
                                {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </div>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </DashboardCard>

           <DashboardCard title="Task Deadlines">
              <div className="space-y-4">
                 {tasks.filter(t => t.due_date && t.status !== 'done').length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-2xl bg-muted/20">
                       <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">All Clear</p>
                    </div>
                 ) : (
                    tasks.filter(t => t.due_date && t.status !== 'done').slice(0, 5).map(task => (
                       <div key={task.id} className="flex gap-4 p-3 rounded-2xl border border-transparent hover:border-border hover:bg-muted/30 transition-all group">
                          <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                             <CalendarIcon className="h-5 w-5 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <h4 className="text-sm font-bold truncate">{task.title}</h4>
                             <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                <span className="px-1.5 py-0.5 rounded bg-muted">Due {task.due_date}</span>
                             </div>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </DashboardCard>
        </div>
      </div>

      {/* Selected Event Details Modal */}
      {selectedEvent && !showEventEditForm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-card rounded-[32px] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Event Details
                </span>
                <h3 className="text-xl font-bold tracking-tight mt-2">{selectedEvent.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors border border-border bg-background cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {selectedEvent.description && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Description</span>
                  <p className="text-sm font-semibold text-foreground/80 leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/50">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 bg-muted/25 p-3 rounded-xl border border-border/40">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Start Time
                  </span>
                  <p className="text-xs font-bold text-foreground mt-1">
                    {new Date(selectedEvent.start_time).toLocaleString("default", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="space-y-1 bg-muted/25 p-3 rounded-xl border border-border/40">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> End Time
                  </span>
                  <p className="text-xs font-bold text-foreground mt-1">
                    {new Date(selectedEvent.end_time).toLocaleString("default", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {selectedEvent.recurrence_interval_type && selectedEvent.recurrence_interval_type !== "none" && (
                <div className="bg-purple-500/[0.02] border border-purple-500/10 p-4 rounded-xl flex items-start gap-3">
                  <RefreshCw className="h-4.5 w-4.5 text-purple-500 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Recurrence Schedule</span>
                    <p className="text-xs font-bold text-foreground mt-0.5 leading-relaxed">
                      {getRecurrenceSummary({
                        intervalType: selectedEvent.recurrence_interval_type as any,
                        intervalCount: selectedEvent.recurrence_interval_count ?? 1,
                        weekdays: selectedEvent.recurrence_weekdays,
                        endType: selectedEvent.recurrence_end_type as any,
                        endDate: selectedEvent.recurrence_end_date,
                        endCount: selectedEvent.recurrence_end_count,
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-muted/20 border-t border-border flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-border bg-background hover:bg-muted transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => setShowEventEditForm(true)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-accent text-accent-foreground shadow-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                Edit Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Event Edit Form Overlay */}
      {selectedEvent && showEventEditForm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-card rounded-[32px] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Edit Event</h3>
                <p className="text-sm text-muted-foreground mt-1">Make changes to this scheduled event.</p>
              </div>
              <button 
                onClick={() => {
                  setShowEventEditForm(false);
                  setSelectedEvent(null);
                }}
                className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors border border-border bg-background cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <EventForm 
                userId={userId}
                event={selectedEvent}
                onClose={() => {
                  setShowEventEditForm(false);
                  setSelectedEvent(null);
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
