import { cn } from "@/lib/utils";

type AuthStatusMessageProps = {
  tone: "error" | "success" | "info";
  message: string;
};

export function AuthStatusMessage({
  tone,
  message,
}: AuthStatusMessageProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        tone === "error" &&
          "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300",
        tone === "success" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
        tone === "info" &&
          "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
      )}
    >
      {message}
    </div>
  );
}
