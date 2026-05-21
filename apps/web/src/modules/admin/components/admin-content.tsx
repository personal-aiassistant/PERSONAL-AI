"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  BarChart3,
  Zap,
  FolderKanban,
  MessageSquareCode,
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const PLAN_COLORS: Record<string, string> = {
  free: "#6b7280",
  pro: "#6366f1",
  team: "#f59e0b",
};

const CHART_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface SystemStats {
  users: { total: number; newThisMonth: number; activeToday: number };
  content: { totalProjects: number; totalGenerations: number; generationsThisMonth: number; totalChatMessages: number };
  plans: { plan: string; count: number }[];
  topGeneratorTypes: { type: string; count: number }[];
  tokens: { totalUsed: number; avgPerUser: number; maxByUser: number };
}

interface User {
  userId: string;
  fullName: string | null;
  email: string;
  plan: string;
  role: string;
  tokenUsed: number;
  tokenLimit: number;
  createdAt: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

async function getToken(): Promise<string> {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  } catch { return ""; }
}

async function adminFetch(path: string) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  const json = await res.json();
  return json.data ?? json;
}

export function AdminContent() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<SystemStats>({
    queryKey: ["admin-stats"],
    queryFn: () => adminFetch("/admin/stats"),
    enabled: !!user,
    retry: false,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery<UsersResponse>({
    queryKey: ["admin-users", page, search],
    queryFn: () =>
      adminFetch(`/admin/users?page=${page}&limit=15${search ? `&search=${encodeURIComponent(search)}` : ""}`),
    enabled: !!user,
    retry: false,
  });

  const { data: signups = [] } = useQuery<{ date: string; count: number }[]>({
    queryKey: ["admin-signups"],
    queryFn: () => adminFetch("/admin/signups?days=30"),
    enabled: !!user,
    retry: false,
  });

  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };

  if (statsError) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="glass rounded-lg p-8 text-center space-y-2">
          <Shield className="w-8 h-8 text-destructive mx-auto" />
          <p className="font-semibold">Admin access required</p>
          <p className="text-sm text-muted-foreground">Your account does not have admin privileges.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total users", value: stats?.users.total ?? 0, sub: `+${stats?.users.newThisMonth ?? 0} this month`, icon: Users, color: "text-primary" },
    { label: "Total projects", value: stats?.content.totalProjects ?? 0, sub: "across all users", icon: FolderKanban, color: "text-amber-500" },
    { label: "AI generations", value: stats?.content.totalGenerations ?? 0, sub: `${stats?.content.generationsThisMonth ?? 0} this month`, icon: Zap, color: "text-green-500" },
    { label: "Chat messages", value: stats?.content.totalChatMessages ?? 0, sub: "total conversations", icon: MessageSquareCode, color: "text-purple-500" },
    { label: "Tokens used (total)", value: `${((stats?.tokens.totalUsed ?? 0) / 1_000_000).toFixed(1)}M`, sub: `avg ${((stats?.tokens.avgPerUser ?? 0) / 1000).toFixed(0)}k/user`, icon: BarChart3, color: "text-cyan-500" },
    { label: "Active today", value: stats?.users.activeToday ?? 0, sub: "users with recent activity", icon: TrendingUp, color: "text-rose-500" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">System-wide statistics and user management</p>
        </div>
      </div>

      {/* Stat cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map((s) => (
          <motion.div key={s.label} variants={item} className="glass rounded-lg p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <s.icon className={cn("w-4 h-4", s.color)} />
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {statsLoading ? <span className="text-muted-foreground text-base">...</span> : s.value}
            </p>
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Signups chart */}
        <div className="glass rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-4">Daily signups (30 days)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={signups} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
              />
              <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#adminGrad)" strokeWidth={2} name="Signups" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Plan breakdown */}
        <div className="glass rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-4">Plan distribution</h3>
          {stats?.plans && stats.plans.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={stats.plans} dataKey="count" nameKey="plan" cx="50%" cy="50%" outerRadius={60} innerRadius={30}>
                    {stats.plans.map((p) => (
                      <Cell key={p.plan} fill={PLAN_COLORS[p.plan] || "#6b7280"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {stats.plans.map((p) => (
                  <div key={p.plan} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: PLAN_COLORS[p.plan] || "#6b7280" }} />
                      <span className="capitalize">{p.plan}</span>
                    </div>
                    <span className="font-medium tabular-nums">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center pt-8">No data yet</p>
          )}
        </div>
      </div>

      {/* Top generator types */}
      {stats?.topGeneratorTypes && stats.topGeneratorTypes.length > 0 && (
        <div className="glass rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Generator usage (all users)</h3>
          <div className="flex flex-wrap gap-2">
            {stats.topGeneratorTypes.map((g, i) => (
              <div key={g.type} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border border-border bg-muted/30">
                <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="capitalize">{g.type.replace(/-/g, " ")}</span>
                <span className="font-medium tabular-nums text-muted-foreground">{g.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User management table */}
      <div className="glass rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-sm font-semibold">User management</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
                className="pl-8 h-8 text-xs w-52"
              />
            </div>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setSearch(searchInput); setPage(1); }}>
              Search
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Plan</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Tokens</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {usersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-3 bg-muted/40 rounded animate-pulse w-full" />
                    </td>
                  </tr>
                ))
              ) : usersData?.users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No users found</td>
                </tr>
              ) : (
                usersData?.users.map((u) => (
                  <tr key={u.userId} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{u.fullName || "—"}</p>
                        <p className="text-muted-foreground">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.plan === "pro" ? "default" : "secondary"} className="text-xs capitalize">
                        {u.plan}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.role === "admin" ? "destructive" : "outline"} className="text-xs">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {u.tokenUsed >= 1000 ? `${(u.tokenUsed / 1000).toFixed(1)}k` : u.tokenUsed}
                      <span className="text-muted-foreground"> / {(u.tokenLimit / 1000).toFixed(0)}k</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {usersData && usersData.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Page {usersData.page} of {usersData.totalPages} · {usersData.total} total
            </p>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={page >= usersData.totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
