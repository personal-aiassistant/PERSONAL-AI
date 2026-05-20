"use client";

import { FolderKanban, MoreHorizontal, Archive, Trash2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Project } from "@codeforge/types";

interface ProjectCardProps {
  project: Project;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusConfig = {
  active: { label: "Active", variant: "success" as const },
  archived: { label: "Archived", variant: "secondary" as const },
  draft: { label: "Draft", variant: "warning" as const },
};

export function ProjectCard({ project, onArchive, onDelete }: ProjectCardProps) {
  const status = statusConfig[project.status] ?? statusConfig.active;
  const updatedAt = new Date(project.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="glass rounded-lg p-4 hover:border-primary/30 transition-colors group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <FolderKanban className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{project.name}</p>
            {project.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {project.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={status.variant} className="text-xs">
            {status.label}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                )}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem>
                <ExternalLink className="w-4 h-4" />
                Open
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onArchive?.(project.id)}>
                <Archive className="w-4 h-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete?.(project.id)}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground">Updated {updatedAt}</p>
      </div>
    </div>
  );
}
