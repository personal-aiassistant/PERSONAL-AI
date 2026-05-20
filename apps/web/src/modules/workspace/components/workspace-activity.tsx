"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  UserPlus, FileText, MessageSquare, Trash2, Edit, Settings,
  GitBranch, Database, Server, Activity,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string | null;
  metadata: Record<string, string> | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

const actionConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  invited_member:    { icon: UserPlus,       label: "invited",          color: "text-blue-500 bg-blue-500/10" },
  created_project:   { icon: FileText,       label: "created project",  color: "text-green-500 bg-green-500/10" },
  deleted_project:   { icon: Trash2,         label: "deleted project",  color: "text-red-500 bg-red-500/10" },
  updated_project:   { icon: Edit,           label: "updated project",  color: "text-amber-500 bg-amber-500/10" },
  sent_message:      { icon: MessageSquare,  label: "sent a message",   color: "text-purple-500 bg-purple-500/10" },
  updated_settings:  { icon: Settings,       label: "updated settings", color: "text-muted-foreground bg-muted" },
  generated_arch:    { icon: Server,         label: "generated architecture", color: "text-cyan-500 bg-cyan-500/10" },
  generated_schema:  { icon: Database,       label: "generated schema", color: "text-indigo-500 bg-indigo-500/10" },
  generated_cicd:    { icon: GitBranch,      label: "generated CI/CD",  color: "text-orange-500 bg-orange-500/10" },
};

const defaultAction = { icon: Activity, label: "performed an action", color: "text-muted-foreground bg-muted" };

function getActionText(log: ActivityLog): string {
  const config = actionConfig[log.action];
  if (config) {
    if (log.action === "invited_member" && log.metadata?.email) {
      return `invited ${log.metadata.email} as ${log.metadata.role ?? "member"}`;
    }
    return config.label;
  }
  return log.action.replace(/_/g, " ");
}

interface WorkspaceActivityProps {
  workspaceId: string;
}

export function WorkspaceActivity({ workspaceId }: WorkspaceActivityProps) {
  const { data: logs = [], isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["workspace-activity", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/activity?limit=30`);
      if (!res.ok) throw new Error("Failed to fetch activity");
      const { data } = await res.json();
      return data ?? [];
    },
    enabled: !!workspaceId,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-2.5 w-1/4 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <Activity className="w-9 h-9 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">No activity yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Actions in this workspace will appear here</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border/50" />
      <div className="space-y-4 pl-10">
        {logs.map((log) => {
          const config = actionConfig[log.action] ?? defaultAction;
          const Icon = config.icon;
          return (
            <div key={log.id} className="relative flex items-start gap-3">
              <div className={cn("absolute -left-10 flex items-center justify-center w-8 h-8 rounded-full shrink-0", config.color)}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <Avatar className="w-6 h-6 shrink-0 mt-0.5">
                  <AvatarImage src={log.avatar_url ?? ""} />
                  <AvatarFallback className="text-[10px]">
                    {(log.full_name ?? "?").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{log.full_name ?? "Someone"}</span>{" "}
                    <span className="text-muted-foreground">{getActionText(log)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
