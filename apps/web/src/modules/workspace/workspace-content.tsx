"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Activity, Settings, BarChart3, FolderKanban, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkspaceMembers } from "./components/workspace-members";
import { WorkspaceActivity } from "./components/workspace-activity";
import { WorkspaceSettingsForm } from "./components/workspace-settings-form";
import { useAuthStore } from "@/store/auth-store";

interface WorkspaceData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
  my_role: "owner" | "admin" | "member" | "viewer";
  member_count: string;
  project_count: string;
}

export function WorkspaceContent() {
  const { user } = useAuthStore();

  const { data: workspace, isLoading } = useQuery<WorkspaceData>({
    queryKey: ["workspace-default", user?.id],
    queryFn: async () => {
      // Get default workspace
      const res = await fetch("/api/workspaces/default");
      if (!res.ok) return null;
      const { data } = await res.json();
      if (!data) return null;

      // Get full workspace details
      const detailRes = await fetch(`/api/workspaces/${data.id}`);
      if (!detailRes.ok) return null;
      const { data: detail } = await detailRes.json();
      return detail;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Zap className="w-10 h-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No workspace found</p>
      </div>
    );
  }

  const stats = [
    { label: "Members", value: workspace.member_count, icon: Users, color: "text-blue-500" },
    { label: "Projects", value: workspace.project_count, icon: FolderKanban, color: "text-green-500" },
    { label: "Plan", value: "Free", icon: BarChart3, color: "text-amber-500" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{workspace.name}</h1>
            <Badge variant="secondary" className="text-xs capitalize">{workspace.my_role}</Badge>
          </div>
          {workspace.description && (
            <p className="text-sm text-muted-foreground mt-1">{workspace.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">/{workspace.slug}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members" className="text-xs gap-1.5">
            <Users className="w-3.5 h-3.5" /> Members
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Activity
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs gap-1.5">
            <Settings className="w-3.5 h-3.5" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Team members</CardTitle>
              <CardDescription className="text-xs">Manage who has access to this workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkspaceMembers workspaceId={workspace.id} myRole={workspace.my_role} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Activity log</CardTitle>
              <CardDescription className="text-xs">Recent actions in this workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkspaceActivity workspaceId={workspace.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Workspace settings</CardTitle>
              <CardDescription className="text-xs">Configure your workspace name and details</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkspaceSettingsForm workspace={workspace} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
