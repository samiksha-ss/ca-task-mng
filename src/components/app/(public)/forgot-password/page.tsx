import { AuthCard } from "@/features/auth/components/auth-card";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <AuthCard
        title="Reset password"
        description="Send a secure recovery link to the email address associated with your CA Task Manager account."
      >
        <div className="space-y-5">
          <ForgotPasswordForm />
        </div>
      </AuthCard>
    </main>
  );
}
