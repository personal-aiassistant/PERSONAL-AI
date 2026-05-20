import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/modules/auth/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your CodeForge AI account password",
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <ForgotPasswordForm />
    </main>
  );
}
