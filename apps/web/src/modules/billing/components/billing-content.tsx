"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Zap, Building2, CreditCard, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: { usd: 0, bdt: 0 },
    description: "Perfect for exploring CodeForge AI",
    badge: null,
    features: [
      "100,000 tokens/month",
      "5 AI chat messages/day",
      "2 projects",
      "GPT-4o Mini access",
      "6 AI generator tools",
      "Community support",
    ],
    cta: "Current plan",
    ctaVariant: "outline" as const,
    disabled: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: { usd: 19, bdt: 2100 },
    description: "For professional developers",
    badge: "Most popular",
    features: [
      "2,000,000 tokens/month",
      "Unlimited AI chats",
      "Unlimited projects",
      "GPT-4o + GPT-4 Turbo access",
      "All 7 AI generator tools",
      "Architecture & PRD generator",
      "API builder & Schema gen",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    ctaVariant: "default" as const,
    disabled: false,
  },
  {
    id: "team",
    name: "Team",
    price: { usd: 49, bdt: 5400 },
    description: "For teams building together",
    badge: "Coming soon",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Shared workspaces",
      "Team AI context",
      "Collaboration tools",
      "Admin dashboard",
      "SSO support",
      "SLA guarantee",
    ],
    cta: "Contact sales",
    ctaVariant: "outline" as const,
    disabled: true,
  },
];

interface UsageData {
  tokens_used: number;
  messages_total: number;
  messages_monthly: number;
  total_projects: number;
  plan: string;
  limits: { free: number; pro: number };
  usage_percent: number;
  generators_by_type: { type: string; count: number }[];
}

export function BillingContent() {
  const { user } = useAuthStore();

  const { data: usage, isLoading } = useQuery<UsageData>({
    queryKey: ["usage", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/usage");
      if (!res.ok) throw new Error("Failed to fetch usage");
      const { data } = await res.json();
      return data;
    },
    enabled: !!user,
  });

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  const usageItems = [
    {
      label: "Tokens used",
      used: usage?.tokens_used ?? 0,
      limit: usage?.limits.free ?? 100000,
      format: (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n),
    },
    {
      label: "Total messages",
      used: usage?.messages_total ?? 0,
      limit: 150,
      format: (n: number) => String(n),
    },
    {
      label: "Projects",
      used: usage?.total_projects ?? 0,
      limit: 2,
      format: (n: number) => String(n),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Billing & Plans</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your subscription and usage</p>
      </div>

      {/* Current Usage */}
      <div className="glass rounded-lg p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Current plan: Free</h3>
          </div>
          <Badge variant="secondary" className="text-xs">Free tier</Badge>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {usageItems.map((u) => {
            const pct = Math.min((u.used / u.limit) * 100, 100);
            return (
              <div key={u.label} className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{u.label}</span>
                  <span className="font-medium tabular-nums">
                    {isLoading ? "..." : `${u.format(u.used)} / ${u.format(u.limit)}`}
                  </span>
                </div>
                <Progress
                  value={isLoading ? 0 : pct}
                  className={cn("h-1.5", pct >= 90 ? "[&>div]:bg-destructive" : pct >= 70 ? "[&>div]:bg-amber-500" : "")}
                />
              </div>
            );
          })}
        </div>

        {/* Generator breakdown */}
        {usage?.generators_by_type && usage.generators_by_type.length > 0 && (
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">Generators used</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {usage.generators_by_type.map((g) => (
                <Badge key={g.type} variant="outline" className="text-xs capitalize">
                  {g.type.replace(/_/g, " ")} · {g.count}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-base font-semibold mb-4">Choose your plan</h2>
        <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              variants={item}
              className={cn(
                "glass rounded-lg p-5 flex flex-col",
                plan.id === "pro" && "border-primary/50 ring-1 ring-primary/20"
              )}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  {plan.id === "free" ? (
                    <Zap className="w-4 h-4 text-muted-foreground" />
                  ) : plan.id === "pro" ? (
                    <Zap className="w-4 h-4 text-primary" />
                  ) : (
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                  )}
                  <h3 className="font-semibold">{plan.name}</h3>
                </div>
                {plan.badge && (
                  <Badge variant={plan.badge === "Most popular" ? "default" : "secondary"} className="text-xs">
                    {plan.badge}
                  </Badge>
                )}
              </div>

              <div className="mt-3 mb-1">
                <span className="text-3xl font-bold">${plan.price.usd}</span>
                <span className="text-muted-foreground text-sm">/mo</span>
                {plan.price.bdt > 0 && (
                  <p className="text-xs text-muted-foreground">৳{plan.price.bdt.toLocaleString()}/mo</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs">
                    <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button variant={plan.ctaVariant} size="sm" disabled={plan.disabled} className="w-full">
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </motion.div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Payments via Stripe (Global) · SSLCommerz &amp; bKash (Bangladesh) — Coming soon
        </p>
      </div>
    </motion.div>
  );
}
