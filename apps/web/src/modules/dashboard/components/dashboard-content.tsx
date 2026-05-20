"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  FolderKanban, MessageSquareCode, Zap, TrendingUp, Plus,
  ArrowRight, Server, FileText, PlugZap, Database, Container, GitBranch, BookOpen,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth-store";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

interface RecentProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  language: string | null;
  updated_at: string;
}

export function DashboardContent() {
  const t = useTranslations("dashboard");
  const { user, profile } = useAuthStore();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  const { data: recentProjects = [], isLoading: projectsLoading } = useQuery<RecentProject[]>({
    queryKey: ["recent-projects", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/projects?limit=4");
      if (!res.ok) return [];
      const { data } = await res.json();
      return data ?? [];
    },
    enabled: !!user,
  });

  const displayName =
    profile?.full_name?.split(" ")[0] ??
    user?.user_metadata?.full_name?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "there";

  const statItems = [
    {
      label: t("totalProjects"),
      value: stats?.totalProjects ?? 0,
      icon: FolderKanban,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: t("aiChatsToday"),
      value: stats?.aiChatsToday ?? 0,
      icon: MessageSquareCode,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: t("tokensUsed"),
      value: stats?.tokensUsed ? (stats.tokensUsed > 1000 ? `${(stats.tokensUsed / 1000).toFixed(1)}k` : stats.tokensUsed) : 0,
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "This month",
      value: "↑ Active",
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
  ];

  const aiTools = [
    { href: "/architecture", icon: Server, label: "Architecture", color: "text-blue-500 bg-blue-500/10" },
    { href: "/prd", icon: FileText, label: "PRD", color: "text-green-500 bg-green-500/10" },
    { href: "/api-builder", icon: PlugZap, label: "API Builder", color: "text-amber-500 bg-amber-500/10" },
    { href: "/schema", icon: Database, label: "Schema", color: "text-indigo-500 bg-indigo-500/10" },
    { href: "/docker", icon: Container, label: "Docker", color: "text-cyan-500 bg-cyan-500/10" },
    { href: "/cicd", icon: GitBranch, label: "CI/CD", color: "text-orange-500 bg-orange-500/10" },
    { href: "/documentation", icon: BookOpen, label: "Docs", color: "text-rose-500 bg-rose-500/10" },
    { href: "/ai-chat", icon: MessageSquareCode, label: "AI Chat", color: "text-purple-500 bg-purple-500/10" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-500",
    archived: "bg-muted-foreground",
    draft: "bg-amber-500",
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-semibold">
          {t("welcomeMessage", { name: displayName })} 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Here&apos;s what&apos;s happening with your workspace today.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((stat) => (
          <div key={stat.label} className="glass rounded-lg p-4 space-y-3">
            <div className={`w-8 h-8 rounded-md ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              {statsLoading ? (
                <Skeleton className="h-7 w-12 mb-1" />
              ) : (
                <p className="text-2xl font-semibold">{stat.value}</p>
              )}
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* AI Tools Grid */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">AI Tools</h2>
          <Badge variant="secondary" className="text-xs">8 tools</Badge>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {aiTools.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              <div className="glass rounded-lg p-3 flex flex-col items-center gap-2 hover:border-primary/40 transition-colors cursor-pointer group text-center">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tool.color}`}>
                  <tool.icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-tight">
                  {tool.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="text-base font-semibold mb-3">{t("quickActions")}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/projects">
            <div className="glass rounded-lg p-5 hover:border-primary/50 transition-colors group cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderKanban className="w-4 h-4 text-primary" />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="font-medium text-sm">{t("newProject")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Manage and organize your projects</p>
            </div>
          </Link>
          <Link href="/ai-chat">
            <div className="glass rounded-lg p-5 hover:border-primary/50 transition-colors group cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquareCode className="w-4 h-4 text-primary" />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="font-medium text-sm">{t("startChatting")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Chat with GPT-4o and other models</p>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Recent Projects */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">{t("recentProjects")}</h2>
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="text-xs">
              View all <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        {projectsLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}
          </div>
        ) : recentProjects.length > 0 ? (
          <div className="space-y-2">
            {recentProjects.map((project) => (
              <Link key={project.id} href="/projects">
                <div className="glass rounded-lg p-4 flex items-center gap-3 hover:border-primary/40 transition-colors cursor-pointer group">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: statusColors[project.status] ?? "#6b7280" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{project.name}</p>
                    {project.description && (
                      <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {project.language && (
                      <Badge variant="secondary" className="text-[10px]">{project.language}</Badge>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass rounded-lg p-10 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <FolderKanban className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">{t("noProjects")}</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">{t("createFirstProject")}</p>
            <Link href="/projects">
              <Button size="sm">
                <Plus className="w-4 h-4" />
                {t("newProject")}
              </Button>
            </Link>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
