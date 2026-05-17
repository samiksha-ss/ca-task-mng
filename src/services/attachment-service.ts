/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TaskAttachment = {
  id: string;
  task_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string | null;
  created_at: string;
  uploader_name: string;
  uploader_email: string;
};

export async function getAttachmentsForTask(taskId: string): Promise<TaskAttachment[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("task_attachments")
    .select(`
      *,
      uploader:uploaded_by(full_name, email)
    `)
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((attachment: any) => ({
    id: attachment.id,
    task_id: attachment.task_id,
    uploaded_by: attachment.uploaded_by,
    file_name: attachment.file_name,
    file_path: attachment.file_path,
    file_size: attachment.file_size,
    mime_type: attachment.mime_type,
    created_at: attachment.created_at,
    uploader_name: attachment.uploader?.full_name || attachment.uploader?.email || "Unknown Profile",
    uploader_email: attachment.uploader?.email || "",
  }));
}

export async function createAttachmentMetadata(input: {
  taskId: string;
  uploadedBy: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType?: string;
}) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("task_attachments")
    .insert({
      task_id: input.taskId,
      uploaded_by: input.uploadedBy,
      file_name: input.fileName,
      file_path: input.filePath,
      file_size: input.fileSize,
      mime_type: input.mimeType || null,
    })
    .select()
    .single();

  return {
    data,
    error: error?.message ?? null,
  };
}

export async function deleteAttachment(attachmentId: string, userId: string) {
  const supabase = await createSupabaseServerClient();

  // Fetch attachment first to delete the file from Supabase Storage
  const { data: attachment, error: fetchError } = await supabase
    .from("task_attachments")
    .select("*")
    .eq("id", attachmentId)
    .maybeSingle();

  if (fetchError || !attachment) {
    return { error: fetchError?.message || "Attachment not found." };
  }

  // Delete from Storage
  const { error: storageError } = await supabase.storage
    .from("task-attachments")
    .remove([attachment.file_path]);

  if (storageError) {
    console.error("Failed to delete file from Supabase Storage:", storageError.message);
  }

  // Delete from Table
  const { error } = await supabase
    .from("task_attachments")
    .delete()
    .eq("id", attachmentId)
    .eq("uploaded_by", userId);

  return {
    error: error?.message ?? null,
  };
}
