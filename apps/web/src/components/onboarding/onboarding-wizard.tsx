"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  MessageSquareCode,
  Server,
  FolderKanban,
  BarChart3,
  ArrowRight,
  Check,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; href: string };
  color: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    icon: <Zap className="w-6 h-6" />,
    title: "Welcome to CodeForge AI!",
    description:
      "Your AI-powered developer workspace is ready. Build faster with AI chat, smart generators, and powerful project tools.",
    color: "text-primary bg-primary/10",
  },
  {
    id: 2,
    icon: <MessageSquareCode className="w-6 h-6" />,
    title: "AI Chat — Your coding assistant",
    description:
      "Chat with GPT-4o about anything — debug code, explain concepts, write functions, or brainstorm architecture. Select your model and start a conversation.",
    action: { label: "Try AI Chat", href: "/ai-chat" },
    color: "text-purple-500 bg-purple-500/10",
  },
  {
    id: 3,
    icon: <Server className="w-6 h-6" />,
    title: "8 AI Generator Tools",
    description:
      "Generate system architecture, PRDs, API specs, DB schemas, Dockerfiles, CI/CD pipelines, documentation, and code reviews — all with AI in seconds.",
    action: { label: "Try Architecture Generator", href: "/architecture" },
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    id: 4,
    icon: <FolderKanban className="w-6 h-6" />,
    title: "Organize with Projects",
    description:
      "Create projects to group your generators and keep your work organized. Share workspaces with your team and track everything in one place.",
    action: { label: "Create a Project", href: "/projects" },
    color: "text-green-500 bg-green-500/10",
  },
  {
    id: 5,
    icon: <BarChart3 className="w-6 h-6" />,
    title: "You're all set! 🎉",
    description:
      "Your dashboard shows real-time stats, token usage, and recent activity. Explore your analytics to see how you're using CodeForge AI.",
    action: { label: "Go to Dashboard", href: "/dashboard" },
    color: "text-cyan-500 bg-cyan-500/10",
  },
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [completing, setCompleting] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const name = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await fetch("/api/onboarding", { method: "POST" });
    } catch {}
    onComplete();
    setCompleting(false);
  };

  const handleAction = async () => {
    if (isLast) {
      await handleComplete();
      if (current.action?.href) router.push(current.action.href);
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className="glass rounded-2xl shadow-2xl w-full max-w-lg border border-border overflow-hidden"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i < step
                    ? "bg-primary w-5"
                    : i === step
                    ? "bg-primary w-8"
                    : "bg-muted w-5"
                )}
              />
            ))}
          </div>
          <button
            onClick={handleComplete}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Skip onboarding"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="px-6 py-6"
          >
            {/* Icon */}
            <div className={cn("inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4", current.color)}>
              {current.icon}
            </div>

            {/* Step 1 greeting */}
            <h2 className="text-xl font-semibold mb-2">
              {step === 0 ? `Welcome, ${name}! 👋` : current.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {current.description}
            </p>

            {/* Feature highlights for step 1 */}
            {step === 0 && (
              <div className="grid grid-cols-2 gap-2 mb-6">
                {[
                  { icon: <MessageSquareCode className="w-3.5 h-3.5" />, label: "AI Chat" },
                  { icon: <Server className="w-3.5 h-3.5" />, label: "8 Generators" },
                  { icon: <FolderKanban className="w-3.5 h-3.5" />, label: "Projects" },
                  { icon: <Sparkles className="w-3.5 h-3.5" />, label: "Analytics" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 text-xs">
                    <span className="text-primary">{f.icon}</span>
                    {f.label}
                  </div>
                ))}
              </div>
            )}

            {/* Completed steps checklist on last step */}
            {isLast && (
              <div className="space-y-2 mb-6">
                {["AI Chat ready", "8 generator tools available", "Projects & workspace set up", "Analytics tracking active"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer buttons */}
        <div className="px-6 pb-6 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-muted-foreground"
          >
            Back
          </Button>

          <div className="flex items-center gap-2">
            {!isLast && (
              <Button variant="ghost" size="sm" onClick={handleComplete} className="text-muted-foreground text-xs">
                Skip tour
              </Button>
            )}
            <Button size="sm" onClick={handleAction} disabled={completing}>
              {isLast ? (
                completing ? "Getting started..." : (current.action?.label ?? "Get started")
              ) : (
                <>
                  {current.action?.label ?? "Next"}
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
