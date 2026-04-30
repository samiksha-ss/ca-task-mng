export const toneMap = {
  dashboard: "default",
  tasks: "info",
  board: "info",
  calendar: "info",
  companies: "default",
  teams: "default",
  members: "default",
  analytics: "success",
  notifications: "warning",
  settings: "default",
  admin: "danger",
} as const;

export type PageTone = keyof typeof toneMap;
