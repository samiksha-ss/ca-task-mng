import { AuthCard } from "@/features/auth/components/auth-card";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <AuthCard
        title="Choose a new password"
        description="After opening the reset link from your email, set a new password for your workspace account."
      >
        <div className="space-y-5">
          <ResetPasswordForm />
        </div>
      </AuthCard>
    </main>
  );
}
