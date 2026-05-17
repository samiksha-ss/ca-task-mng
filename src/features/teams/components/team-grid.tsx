"use client";

import { useState } from "react";
import type { TeamSummary, MemberSummary } from "@/services/team-service";
import { Pencil, Trash2, X } from "lucide-react";
import { TeamEditForm } from "./team-edit-form";
import { TeamDeleteForm } from "./team-delete-form";

type TeamGridProps = {
  teams: TeamSummary[];
  members?: MemberSummary[];
  role?: string;
};

export function TeamGrid({ teams, members = [], role }: TeamGridProps) {
  const [editingTeam, setEditingTeam] = useState<TeamSummary | null>(null);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const isAdmin = role === "admin";

  if (teams.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-border bg-card p-8 text-sm text-muted-foreground shadow-sm">
        No teams are visible in your current workspace scope yet.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-2">
        {teams.map((team) => (
          <article
            key={team.id}
            className="rounded-[28px] border border-border bg-card p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">{team.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {team.description ?? "No team description added yet."}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {team.member_count} members
                  </span>
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <button
                        onClick={() => {
                          setEditingTeam(team);
                          setIsEditOpen(true);
                        }}
                        className="h-8 w-8 rounded-lg border border-border bg-background flex items-center justify-center hover:bg-muted hover:border-border/80 transition-all active:scale-95 shadow-sm cursor-pointer"
                        title="Edit Team"
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingTeamId(team.id);
                          setIsDeleteOpen(true);
                        }}
                        className="h-8 w-8 rounded-lg border border-border bg-background flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/30 transition-all active:scale-95 shadow-sm cursor-pointer group"
                        title="Delete Team"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-[22px] border border-border bg-background p-4">
                  <dt className="text-muted-foreground">Manager</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {team.manager_name ?? "Not assigned"}
                  </dd>
                </div>
                <div className="rounded-[22px] border border-border bg-background p-4">
                  <dt className="text-muted-foreground">Manager email</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {team.manager_email ?? "Not available"}
                  </dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>

      {/* Edit Team Modal */}
      {isEditOpen && editingTeam && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-card rounded-[32px] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Edit Team</h3>
                <p className="text-sm text-muted-foreground mt-1">Update team boundaries, manager coverage, or description.</p>
              </div>
              <button 
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingTeam(null);
                }}
                className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors border border-border bg-background cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <TeamEditForm team={editingTeam} members={members} />
            </div>
          </div>
        </div>
      )}

      {/* Delete Team Modal */}
      {isDeleteOpen && deletingTeamId && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-card rounded-[32px] border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-red-500">Delete Team</h3>
                <p className="text-sm text-muted-foreground mt-1">This action is permanent and unlinks team relations.</p>
              </div>
              <button 
                onClick={() => {
                  setIsDeleteOpen(false);
                  setDeletingTeamId(null);
                }}
                className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors border border-border bg-background cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <TeamDeleteForm teamId={deletingTeamId} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

