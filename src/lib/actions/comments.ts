"use server";

import { requireCurrentUserContext } from "@/lib/auth/session";
import { createComment, deleteComment } from "@/services/comment-service";
import { revalidatePath } from "next/cache";

export async function createCommentAction(input: {
  taskId: string;
  content: string;
}) {
  const context = await requireCurrentUserContext();
  
  const result = await createComment({
    taskId: input.taskId,
    createdBy: context.user.id,
    content: input.content,
  });

  if (!result.error) {
    revalidatePath(`/tasks/${input.taskId}`);
  }

  return result;
}

export async function deleteCommentAction(input: {
  commentId: string;
  taskId: string;
}) {
  const context = await requireCurrentUserContext();

  const result = await deleteComment(input.commentId, context.user.id);

  if (!result.error) {
    revalidatePath(`/tasks/${input.taskId}`);
  }

  return result;
}
