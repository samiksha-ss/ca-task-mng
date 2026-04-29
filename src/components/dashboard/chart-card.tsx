import { BarChart3 } from "lucide-react";

export function ChartCard() {
  return (
    <div className="flex flex-col items-center justify-center py-6 h-full min-h-[200px] border border-dashed border-border rounded-xl bg-muted/20">
      <div className="flex items-end gap-2 sm:gap-4 h-32 mb-6 w-full px-4 sm:px-8 justify-between mt-auto">
        {[40, 70, 45, 90, 65, 85, 120].map((height, i) => (
          <div key={i} className="w-full max-w-[2rem] bg-accent/20 rounded-t-sm hover:bg-accent transition-all relative group" style={{ height: `${(height / 120) * 100}%` }}>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border border-border text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition shadow-sm z-10 pointer-events-none">
              {height}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
        <BarChart3 className="h-4 w-4" />
        Task velocity over last 7 days
      </div>
    </div>
  );
}
