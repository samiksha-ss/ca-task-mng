import type { User } from "@supabase/supabase-js";
import type { Profile } from "./database";

export type AuthActionState = {
  error: string | null;
  success: string | null;
};

export type CurrentUserContext = {
  user: User;
  profile: Profile | null;
  profileError: string | null;
};
