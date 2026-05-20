import { AuthBackground } from "@/modules/auth/components/auth-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <AuthBackground />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
