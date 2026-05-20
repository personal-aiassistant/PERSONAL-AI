"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Zap,
  Code2,
  MessageSquare,
  FolderKanban,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import apiClient from "@/lib/api-client";

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6", "#f97316", "#8b5cf6"];

const GENERATOR_LABELS: Record<string, string> = {
  architecture: "Architecture",
  prd: "PRD",
  "api-builder": "API Builder",
  schema: "Schema",
  docker: "Docker",
  cicd: "CI/CD",
  documentation: "Documentation",
};

interface DashboardStats {
  projects: { total: number; active: number; archived: number };
  generators: { allTime: number; thisMonth: number };
  chat: { messagesLast30Days: number };
  tokens: { used: number; limit: number; plan: string; usagePercent: number };
  topGeneratorTypes: Array<{ type: string; count: number }>;
  recentActivity: Array<{ id: string; type: string; prompt: string; tokensUsed: number; createdAt: string }>;
}

interface TokenTrend {
  date: string;
  tokens: number;
  requests: number;
}

interface GeneratorBreakdown {
  byType: Array<{ type: string; count: number; totalTokens: number }>;
  byModel: Array<{ model: string; count: number }>;
  thisMonthByType: Array<{ type: string; tokens: number }>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-primary",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className={`rounded-xl bg-muted p-2.5 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function AnalyticsContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TokenTrend[]>([]);
  const [breakdown, setBreakdown] = useState<GeneratorBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [s, t, b] = await Promise.all([
        apiClient.get<DashboardStats>("/analytics/dashboard"),
        apiClient.get<TokenTrend[]>("/analytics/token-trends"),
        apiClient.get<GeneratorBreakdown>("/analytics/generators"),
      ]);
      setStats(s);
      setTrends(Array.isArray(t) ? t : []);
      setBreakdown(b);
      setApiError(false);
    } catch {
      setApiError(true);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAll().finally(() => setLoading(false));
  }, [fetchAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const pieData = breakdown?.byType.map((t) => ({
    name: GENERATOR_LABELS[t.type] || t.type,
    value: t.count,
  })) || [];

  const trendData = trends.map((t) => ({
    date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    tokens: t.tokens,
    requests: t.requests,
  }));

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">Usage trends and performance metrics</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <BarChart3 className="w-12 h-12 text-muted-foreground opacity-40" />
        <div className="text-center">
          <p className="font-semibold">Analytics Unavailable</p>
          <p className="text-sm text-muted-foreground mt-1">
            NestJS API is not running. Start the API server to view analytics.
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            cd apps/api && node dist/main.js
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 overflow-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Usage trends and performance metrics</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Total Projects"
          value={stats?.projects.total || 0}
          sub={`${stats?.projects.active || 0} active`}
          color="text-indigo-500"
        />
        <StatCard
          icon={Zap}
          label="Tokens Used"
          value={formatTokens(stats?.tokens.used || 0)}
          sub={`of ${formatTokens(stats?.tokens.limit || 50000)} limit`}
          color="text-amber-500"
        />
        <StatCard
          icon={Code2}
          label="Generations"
          value={stats?.generators.allTime || 0}
          sub={`${stats?.generators.thisMonth || 0} this month`}
          color="text-green-500"
        />
        <StatCard
          icon={MessageSquare}
          label="Chat Messages"
          value={stats?.chat.messagesLast30Days || 0}
          sub="last 30 days"
          color="text-pink-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Token Usage Trends</CardTitle>
            <CardDescription>Daily token consumption over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {trendData.length === 0 ? (
              <div className="flex h-56 items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 opacity-30 mx-auto mb-2" />
                  <p className="text-sm">No usage data yet</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={formatTokens} />
                  <Tooltip
                    formatter={(v: number) => [formatTokens(v), "Tokens"]}
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tokens"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#tokenGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Token Limit</CardTitle>
            <CardDescription>
              <Badge variant="secondary" className="text-xs capitalize">
                {stats?.tokens.plan || "free"} plan
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Used</span>
                <span className="font-medium">{stats?.tokens.usagePercent || 0}%</span>
              </div>
              <Progress value={stats?.tokens.usagePercent || 0} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1.5">
                {formatTokens(stats?.tokens.used || 0)} / {formatTokens(stats?.tokens.limit || 50000)} tokens
              </p>
            </div>

            <div className="border-t border-border pt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Top Generator Types</p>
              <div className="flex flex-col gap-2">
                {(stats?.topGeneratorTypes || []).slice(0, 5).map((t) => (
                  <div key={t.type} className="flex items-center justify-between">
                    <span className="text-xs">{GENERATOR_LABELS[t.type] || t.type}</span>
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {t.count}
                    </Badge>
                  </div>
                ))}
                {(stats?.topGeneratorTypes || []).length === 0 && (
                  <p className="text-xs text-muted-foreground">No generations yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generators">
        <TabsList>
          <TabsTrigger value="generators">Generator Breakdown</TabsTrigger>
          <TabsTrigger value="requests">Daily Requests</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="generators" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">By Generator Type</CardTitle>
                <CardDescription>Total generations per tool</CardDescription>
              </CardHeader>
              <CardContent>
                {pieData.length === 0 ? (
                  <div className="flex h-52 items-center justify-center text-muted-foreground">
                    <p className="text-sm">No data yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: 12,
                        }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(v) => <span style={{ fontSize: 12 }}>{v}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tokens by Type</CardTitle>
                <CardDescription>This month's token spend per tool</CardDescription>
              </CardHeader>
              <CardContent>
                {(breakdown?.thisMonthByType || []).length === 0 ? (
                  <div className="flex h-52 items-center justify-center text-muted-foreground">
                    <p className="text-sm">No data this month</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={(breakdown?.thisMonthByType || []).map((t) => ({
                        name: GENERATOR_LABELS[t.type] || t.type,
                        tokens: t.tokens,
                      }))}
                      margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={formatTokens} />
                      <Tooltip
                        formatter={(v: number) => [formatTokens(v), "Tokens"]}
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="tokens" radius={[4, 4, 0, 0]}>
                        {(breakdown?.thisMonthByType || []).map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Daily API Requests</CardTitle>
              <CardDescription>Number of AI requests per day</CardDescription>
            </CardHeader>
            <CardContent>
              {trendData.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  <p className="text-sm">No request data yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="requests" fill="#22c55e" radius={[4, 4, 0, 0]} name="Requests" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Generations</CardTitle>
              <CardDescription>Your last 5 AI generations</CardDescription>
            </CardHeader>
            <CardContent>
              {(stats?.recentActivity || []).length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {(stats?.recentActivity || []).map((a) => (
                    <div key={a.id} className="flex items-center gap-3 py-3">
                      <div className="rounded-md bg-muted px-2 py-1 text-xs font-medium shrink-0">
                        {GENERATOR_LABELS[a.type] || a.type}
                      </div>
                      <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                        {a.prompt}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatTokens(a.tokensUsed)} tk
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
