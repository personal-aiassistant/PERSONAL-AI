"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  FolderKanban,
  MessageSquareCode,
  Zap,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export function DashboardContent() {
  const t = useTranslations("dashboard");
  const { user } = useAuthStore();

  const displayName =
    user?.user_metadata?.full_name?.split(" ")[0] ?? "there";

  const stats = [
    {
      label: t("totalProjects"),
      value: "0",
      icon: FolderKanban,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: t("aiChatsToday"),
      value: "0",
      icon: MessageSquareCode,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: t("tokensUsed"),
      value: "0",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "This month",
      value: "↑ 0%",
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
  ];

  const quickActions = [
    {
      href: "/projects/new",
      icon: FolderKanban,
      label: t("newProject"),
      description: "Generate a full-stack project structure",
    },
    {
      href: "/ai-chat",
      icon: MessageSquareCode,
      label: t("startChatting"),
      description: "Chat with GPT-4, Claude, and more",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Welcome */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-semibold">
          {t("welcomeMessage", { name: displayName })} 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Here's what's happening with your workspace today.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass rounded-lg p-4 space-y-3"
          >
            <div className={`w-8 h-8 rounded-md ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="text-base font-semibold mb-3">{t("quickActions")}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="glass rounded-lg p-5 hover:border-primary/50 transition-colors group cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <action.icon className="w-4 h-4 text-primary" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="font-medium text-sm">{action.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Projects */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">{t("recentProjects")}</h2>
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="text-xs">
              View all
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        <div className="glass rounded-lg p-10 text-center">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <FolderKanban className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">{t("noProjects")}</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            {t("createFirstProject")}
          </p>
          <Link href="/projects/new">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              {t("newProject")}
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
