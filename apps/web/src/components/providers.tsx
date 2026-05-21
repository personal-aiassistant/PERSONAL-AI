"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuthListener } from "@/hooks/use-auth";
import { usePresence } from "@/hooks/use-presence";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/auth-store";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthListener();
  return <>{children}</>;
}

function PresenceProvider({ children }: { children: React.ReactNode }) {
  usePresence();
  return <>{children}</>;
}

function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuthStore();
  const [showWizard, setShowWizard] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user) { setChecked(false); setShowWizard(false); return; }
    if (profile === null) return;
    if (!checked) {
      setChecked(true);
      if (profile && profile.onboarding_completed === false) {
        setShowWizard(true);
      }
    }
  }, [user, profile, checked]);

  const handleComplete = () => setShowWizard(false);

  return (
    <>
      {children}
      <AnimatePresence>
        {showWizard && <OnboardingWizard onComplete={handleComplete} />}
      </AnimatePresence>
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <PresenceProvider>
            <OnboardingProvider>{children}</OnboardingProvider>
          </PresenceProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
