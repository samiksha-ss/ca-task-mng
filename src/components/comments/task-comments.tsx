"use client";

import { useState } from "react";
import { createCommentAction, deleteCommentAction } from "@/lib/actions/comments";
import type { TaskComment } from "@/services/comment-service";
import { MessageSquare, Trash2, Send, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

type TaskCommentsProps = {
  taskId: string;
  initialComments: TaskComment[];
  currentUserId: string;
};

export function TaskComments({ taskId, initialComments, currentUserId }: TaskCommentsProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { error } = await createCommentAction({ taskId, content: content.trim() });
      if (error) {
        alert(error);
      } else {
        setContent("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (deletingId || !confirm("Are you sure you want to delete this comment?")) return;

    setDeletingId(commentId);
    try {
      const { error } = await deleteCommentAction({ commentId, taskId });
      if (error) {
        alert(error);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete comment.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2 border-b border-border/60 pb-4">
        <MessageSquare className="h-5 w-5 text-accent" />
        <h3 className="text-xl font-bold tracking-tight">Discussion Thread</h3>
        <span className="ml-auto text-xs font-bold bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
          {initialComments.length} comments
        </span>
      </div>

      {/* Discussion Feed */}
      {initialComments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border/60 rounded-2xl bg-muted/10">
          <p className="text-sm font-semibold text-muted-foreground">No comments yet</p>
          <p className="text-xs text-muted-foreground mt-1">Be the first to share updates or directions on this task.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
          {initialComments.map((comment) => {
            const isOwner = comment.created_by === currentUserId;
            const initials = comment.creator_name
              ? comment.creator_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
              : "U";

            return (
              <div key={comment.id} className="flex items-start gap-3 p-3.5 rounded-2xl bg-background/40 border border-border/40 hover:bg-background/60 transition-colors group">
                <div className="h-8 w-8 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center font-bold text-xs text-accent shrink-0 uppercase">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-bold text-foreground truncate">{comment.creator_name}</h5>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(comment.created_at).toLocaleDateString("en-IN", { dateStyle: "short" })}{" "}
                      {new Date(comment.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed break-words whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
                {isOwner && (
                  <button
                    disabled={deletingId === comment.id}
                    onClick={() => handleDelete(comment.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 rounded-lg hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center shrink-0 text-muted-foreground cursor-pointer"
                    title="Delete Comment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          required
          rows={1}
          placeholder="Write a comment or ask a question..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 min-h-[44px] max-h-[120px] px-4 py-3 rounded-2xl border border-border bg-background/50 focus:ring-1 focus:ring-accent focus:border-accent outline-none text-sm transition-shadow resize-none"
        />
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="h-11 w-11 rounded-2xl bg-accent text-accent-foreground font-bold flex items-center justify-center shrink-0 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 cursor-pointer shadow-md"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
