import { NextResponse, type NextRequest } from "next/server";
import {
  APP_HOME_PATH,
  AUTH_CALLBACK_PATH,
  FORGOT_PASSWORD_PATH,
  LOGIN_PATH,
  RESET_PASSWORD_PATH,
} from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";

function isPublicPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === LOGIN_PATH ||
    pathname === FORGOT_PASSWORD_PATH ||
    pathname === RESET_PASSWORD_PATH ||
    pathname.startsWith(AUTH_CALLBACK_PATH)
  );
}

function isProtectedPath(pathname: string) {
  return pathname.startsWith(APP_HOME_PATH);
}

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);

  if (!isSupabaseConfigured) {
    return response;
  }

  const isAuthenticated = Boolean(user);
  const { pathname } = request.nextUrl;

  if (isProtectedPath(pathname) && !isAuthenticated) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (pathname === LOGIN_PATH && isAuthenticated) {
    return NextResponse.redirect(new URL(APP_HOME_PATH, request.url));
  }

  if (isPublicPath(pathname)) {
    return response;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
