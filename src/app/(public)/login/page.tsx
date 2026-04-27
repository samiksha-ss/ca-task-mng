import Link from "next/link";
import { AuthCard } from "@/features/auth/components/auth-card";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { SupabaseConfigAlert } from "@/features/auth/components/supabase-config-alert";
import { FORGOT_PASSWORD_PATH } from "@/lib/constants/routes";
import { isSupabaseConfigured } from "@/lib/env";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = Array.isArray(resolvedSearchParams.next)
    ? resolvedSearchParams.next[0]
    : resolvedSearchParams.next;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <AuthCard
        title="Sign in"
        description="Access your team workspace to manage deadlines, assignments, and audit-ready task progress."
        footer={
          <p className="text-sm text-muted-foreground">
            Need recovery access?{" "}
            <Link
              href={FORGOT_PASSWORD_PATH}
              className="text-foreground underline underline-offset-4"
            >
              Reset your password
            </Link>
          </p>
        }
      >
        <div className="space-y-5">
          {!isSupabaseConfigured ? <SupabaseConfigAlert /> : null}
          <SignInForm nextPath={nextPath} />
        </div>
      </AuthCard>
    </main>
  );
}
