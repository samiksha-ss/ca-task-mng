const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  publicSupabaseUrl && publicSupabaseAnonKey,
);

export function getSupabaseEnv() {
  if (!publicSupabaseUrl || !publicSupabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return {
    url: publicSupabaseUrl,
    anonKey: publicSupabaseAnonKey,
  };
}
