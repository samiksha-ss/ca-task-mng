/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TaskComment = {
  id: string;
  task_id: string;
  created_by: string;
  content: string;
  created_at: string;
  creator_name: string;
  creator_email: string;
};

export async function getCommentsForTask(taskId: string): Promise<TaskComment[]> {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("task_comments")
    .select(`
      *,
      creator:created_by(full_name, email)
    `)
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((comment: any) => ({
    id: comment.id,
    task_id: comment.task_id,
    created_by: comment.created_by,
    content: comment.content,
    created_at: comment.created_at,
    creator_name: comment.creator?.full_name || comment.creator?.email || "Unknown Profile",
    creator_email: comment.creator?.email || "",
  }));
}

export async function createComment(input: {
  taskId: string;
  createdBy: string;
  content: string;
}) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("task_comments")
    .insert({
      task_id: input.taskId,
      created_by: input.createdBy,
      content: input.content,
    });

  return {
    error: error?.message ?? null,
  };
}

export async function deleteComment(commentId: string, userId: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("task_comments")
    .delete()
    .eq("id", commentId)
    .eq("created_by", userId); // RLS will protect, but double safety in clause

  return {
    error: error?.message ?? null,
  };
}
