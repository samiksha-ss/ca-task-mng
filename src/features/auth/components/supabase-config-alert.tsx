import { AuthStatusMessage } from "./auth-status-message";

export function SupabaseConfigAlert() {
  return (
    <AuthStatusMessage
      tone="info"
      message="Supabase credentials are not set yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your local environment before testing auth."
    />
  );
}
