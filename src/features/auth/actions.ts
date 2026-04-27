"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_CALLBACK_PATH, APP_HOME_PATH, LOGIN_PATH } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/types/auth";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
} from "./schema";

const defaultState: AuthActionState = {
  error: null,
  success: null,
};

function configurationError() {
  return {
    error:
      "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to continue.",
    success: null,
  } satisfies AuthActionState;
}

function getRedirectTarget(formData: FormData) {
  const nextPath = formData.get("next");

  if (typeof nextPath !== "string" || !nextPath.startsWith("/")) {
    return APP_HOME_PATH;
  }

  return nextPath;
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured) {
    return configurationError();
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ...defaultState,
      error: parsed.error.issues[0]?.message ?? "Unable to sign in.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      ...defaultState,
      error: error.message,
    };
  }

  redirect(getRedirectTarget(formData));
}

export async function forgotPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured) {
    return configurationError();
  }

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      ...defaultState,
      error: parsed.error.issues[0]?.message ?? "Unable to send reset email.",
    };
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? "http://localhost:3000";
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}${AUTH_CALLBACK_PATH}?next=/reset-password`,
  });

  if (error) {
    return {
      ...defaultState,
      error: error.message,
    };
  }

  return {
    ...defaultState,
    success: "Reset instructions sent. Check your email for the secure link.",
  };
}

export async function resetPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured) {
    return configurationError();
  }

  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      ...defaultState,
      error: parsed.error.issues[0]?.message ?? "Unable to update password.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ...defaultState,
      error: "Your reset session has expired. Request a new password reset email.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      ...defaultState,
      error: error.message,
    };
  }

  return {
    ...defaultState,
    success: "Password updated successfully. You can continue into the app.",
  };
}

export async function signOutAction() {
  if (!isSupabaseConfigured) {
    redirect(LOGIN_PATH);
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  redirect(LOGIN_PATH);
}
