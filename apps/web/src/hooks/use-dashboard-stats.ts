"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";

interface DashboardStats {
  totalProjects: number;
  aiChatsToday: number;
  tokensUsed: number;
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch("/api/dashboard/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  const { data } = await res.json();
  return data;
}

export function useDashboardStats() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: fetchDashboardStats,
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 mins
  });
}
