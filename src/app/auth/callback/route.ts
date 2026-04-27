import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { APP_HOME_PATH, LOGIN_PATH } from "@/lib/constants/routes";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/env";

export async function GET(request: NextRequest) {
  const redirectUrl = new URL(request.url);
  const code = redirectUrl.searchParams.get("code");
  const next = redirectUrl.searchParams.get("next") ?? APP_HOME_PATH;

  if (!isSupabaseConfigured) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  const { url, anonKey } = getSupabaseEnv();
  const response = NextResponse.redirect(new URL(next, request.url));
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.exchangeCodeForSession(code);

  return response;
}
