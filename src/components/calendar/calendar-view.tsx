"use client";

import { useState } from "react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, Event } from "@/types";
import { EventForm } from "./event-form";

type CalendarViewProps = {
  tasks: Task[];
  events: Event[];
  userId: string;
};

export function CalendarView({ tasks, events, userId }: CalendarViewProps) {
  const [showEventForm, setShowEventForm] = useState(false);
  
  // Simple calendar math for the current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = now.toLocaleString('default', { month: 'long' });

  // Helper to get items for a specific day
  const getItemsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const dayTasks = tasks.filter(t => t.due_date?.split('T')[0] === dateStr);
    const dayEvents = events.filter(e => e.start_time.split('T')[0] === dateStr);
    
    return { tasks: dayTasks, events: dayEvents };
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
          title={`${monthName} ${year}`}
          description="Workspace schedule overview."
          className="min-h-[750px]"
          action={
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
               <button className="h-8 w-10 rounded-lg hover:bg-background transition-colors flex items-center justify-center"><ChevronLeft className="h-4 w-4" /></button>
               <button className="h-8 px-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Today</button>
               <button className="h-8 w-10 rounded-lg hover:bg-background transition-colors flex items-center justify-center"><ChevronRight className="h-4 w-4" /></button>
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
                      <div key={event.id} className="px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-600 dark:text-purple-400 truncate cursor-pointer hover:bg-purple-500/20 transition-colors flex items-center gap-1.5">
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
                       <div key={event.id} className="flex gap-4 p-3 rounded-2xl border border-transparent hover:border-border hover:bg-muted/30 transition-all group">
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
    </>
  );
}
