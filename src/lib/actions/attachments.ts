"use server";

import { requireCurrentUserContext } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAttachmentMetadata, deleteAttachment } from "@/services/attachment-service";
import { revalidatePath } from "next/cache";

export async function uploadAttachmentAction(formData: FormData) {
  try {
    const context = await requireCurrentUserContext();
    const taskId = formData.get("taskId") as string;
    const file = formData.get("file") as File;

    if (!taskId || !file || file.size === 0) {
      return { error: "A valid file attachment is required." };
    }

    const supabase = await createSupabaseServerClient();
    const fileName = file.name;
    const fileSize = file.size;
    const mimeType = file.type;

    // Standardize file paths inside bucket: tasks/[taskId]/[timestamp]_[fileName]
    const timestamp = Date.now();
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `tasks/${taskId}/${timestamp}_${safeFileName}`;

    // Upload buffer to Supabase Storage bucket 'task-attachments'
    const { error: storageError } = await supabase.storage
      .from("task-attachments")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (storageError) {
      return { error: `File storage transfer failed: ${storageError.message}` };
    }

    // Insert metadata record in DB
    const { error: dbError } = await createAttachmentMetadata({
      taskId,
      uploadedBy: context.user.id,
      fileName,
      filePath,
      fileSize,
      mimeType,
    });

    if (dbError) {
      // Rollback file upload in storage on DB error
      await supabase.storage.from("task-attachments").remove([filePath]);
      return { error: `Database entry failed, rolling back upload: ${dbError}` };
    }

    revalidatePath(`/tasks/${taskId}`);
    return { success: true };
  } catch (err) {
    console.error("Upload action error:", err);
    const message = err instanceof Error ? err.message : "An unexpected error occurred during upload.";
    return { error: message };
  }
}

export async function deleteAttachmentAction(input: {
  attachmentId: string;
  taskId: string;
}) {
  const context = await requireCurrentUserContext();

  const result = await deleteAttachment(input.attachmentId, context.user.id);

  if (!result.error) {
    revalidatePath(`/tasks/${input.taskId}`);
  }

  return result;
}
