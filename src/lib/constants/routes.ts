export const APP_HOME_PATH = "/dashboard";
export const LOGIN_PATH = "/login";
export const FORGOT_PASSWORD_PATH = "/forgot-password";
export const RESET_PASSWORD_PATH = "/reset-password";
export const AUTH_CALLBACK_PATH = "/auth/callback";
export const TASKS_PATH = "/tasks";
export const getTaskDetailPath = (taskId: string) => `${TASKS_PATH}/${taskId}`;
export const BOARD_PATH = "/board";
export const CALENDAR_PATH = "/calendar";
export const COMPANIES_PATH = "/companies";
export const TEAMS_PATH = "/teams";
export const MEMBERS_PATH = "/members";
export const ANALYTICS_PATH = "/analytics";
export const NOTIFICATIONS_PATH = "/notifications";
export const SETTINGS_PATH = "/settings";

export const PUBLIC_AUTH_PATHS = [
  LOGIN_PATH,
  FORGOT_PASSWORD_PATH,
  RESET_PASSWORD_PATH,
  AUTH_CALLBACK_PATH,
];
