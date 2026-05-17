"use client";

import { useState, useRef } from "react";
import { uploadAttachmentAction, deleteAttachmentAction } from "@/lib/actions/attachments";
import type { TaskAttachment } from "@/services/attachment-service";
import { Paperclip, Trash2, Download, FileText, Image as ImageIcon, FileSpreadsheet, FileUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type TaskAttachmentsProps = {
  taskId: string;
  initialAttachments: TaskAttachment[];
  currentUserId: string;
};

export function TaskAttachments({ taskId, initialAttachments, currentUserId }: TaskAttachmentsProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string | null, fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (mimeType?.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp"].includes(ext || "")) {
      return <ImageIcon className="h-5 w-5 text-emerald-500" />;
    }
    if (
      mimeType === "text/csv" ||
      ["csv", "xls", "xlsx"].includes(ext || "") ||
      mimeType?.includes("spreadsheet")
    ) {
      return <FileSpreadsheet className="h-5 w-5 text-teal-500" />;
    }
    return <FileText className="h-5 w-5 text-accent" />;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFile(files[0]);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("taskId", taskId);
      formData.append("file", file);

      const { error } = await uploadAttachmentAction(formData);
      if (error) {
        alert(error);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (deletingId || !confirm("Are you sure you want to delete this attachment?")) return;

    setDeletingId(attachmentId);
    try {
      const { error } = await deleteAttachmentAction({ attachmentId, taskId });
      if (error) {
        alert(error);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete attachment.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  return (
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2 border-b border-border/60 pb-4">
        <Paperclip className="h-5 w-5 text-accent" />
        <h3 className="text-xl font-bold tracking-tight">Task Attachments</h3>
        <span className="ml-auto text-xs font-bold bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
          {initialAttachments.length} files
        </span>
      </div>

      {/* Uploader Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={[
          "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all hover:bg-muted/10",
          dragActive
            ? "border-accent bg-accent/[0.03]"
            : "border-border/60 hover:border-accent/40 bg-background/20",
        ].join(" ")}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading ? (
          <>
            <Loader2 className="h-7 w-7 text-accent animate-spin" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Uploading file...</p>
          </>
        ) : (
          <>
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <FileUp className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold">Drag & drop your file here</p>
              <p className="text-xs text-muted-foreground mt-1">Or click to select a file from your device</p>
            </div>
          </>
        )}
      </div>

      {/* Attachments List */}
      {initialAttachments.length === 0 ? (
        <p className="text-xs text-muted-foreground p-3 text-center border border-dashed border-border/60 rounded-xl bg-muted/5">
          No files attached to this task.
        </p>
      ) : (
        <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
          {initialAttachments.map((file) => {
            const isOwner = file.uploaded_by === currentUserId;
            // Public download link
            const downloadUrl = `${supabaseUrl}/storage/v1/object/public/task-attachments/${file.file_path}`;

            return (
              <div
                key={file.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-background/25 border border-border/40 hover:bg-background/50 transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                    {getFileIcon(file.mime_type, file.file_name)}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-foreground truncate max-w-[200px] sm:max-w-xs" title={file.file_name}>
                      {file.file_name}
                    </h5>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5 font-semibold">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span>•</span>
                      <span>By {file.uploader_name}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={downloadUrl}
                    download={file.file_name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 rounded-lg hover:bg-accent/10 flex items-center justify-center text-accent shrink-0 cursor-pointer shadow-sm border border-border"
                    title="Download File"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  {isOwner && (
                    <button
                      disabled={deletingId === file.id}
                      onClick={() => handleDelete(file.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center text-muted-foreground shrink-0 cursor-pointer shadow-sm border border-border"
                      title="Delete File"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
