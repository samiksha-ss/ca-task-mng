type TeamMemberActivity = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  tasksCompleted: number;
  activeTasks: number;
};

type TeamActivityCardProps = {
  members: TeamMemberActivity[];
};

export function TeamActivityCard({ members }: TeamActivityCardProps) {
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <p className="text-sm text-muted-foreground">No team activity data yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <div key={member.id} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-xl transition group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 border border-accent/20 text-accent font-bold text-sm group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
              {member.avatar}
            </div>
            <div>
              <p className="text-sm font-semibold">{member.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{member.role.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
               <span className="text-sm font-bold text-foreground">{member.tasksCompleted}</span>
               <span className="text-[10px] uppercase text-muted-foreground font-bold">Done</span>
            </div>
            <div className="h-1 w-16 bg-muted rounded-full mt-1.5 overflow-hidden">
               <div 
                 className="h-full bg-accent transition-all duration-500" 
                 style={{ width: `${Math.min(100, (member.tasksCompleted / (member.tasksCompleted + member.activeTasks || 1)) * 100)}%` }}
               />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
