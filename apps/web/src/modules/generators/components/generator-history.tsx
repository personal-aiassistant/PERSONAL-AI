"use client";

import { Clock, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GeneratorRecord {
  id: string;
  title: string;
  status: string;
  tokens_used: number | null;
  created_at: string;
  type: string;
}

interface GeneratorHistoryProps {
  items: GeneratorRecord[];
  activeId: string | null;
  onSelect: (item: GeneratorRecord) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const statusConfig = {
  complete: { label: "Done", variant: "success" as const },
  generating: { label: "Generating", variant: "warning" as const },
  error: { label: "Error", variant: "destructive" as const },
  pending: { label: "Pending", variant: "secondary" as const },
};

export function GeneratorHistory({ items, activeId, onSelect, onDelete, isLoading }: GeneratorHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <Clock className="w-8 h-8 text-muted-foreground/40 mb-2" />
        <p className="text-xs text-muted-foreground">No history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {items.map((item) => {
        const status = statusConfig[item.status as keyof typeof statusConfig] ?? statusConfig.pending;
        return (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className={cn(
              "group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors text-left",
              "hover:bg-accent hover:text-accent-foreground",
              activeId === item.id ? "bg-accent text-accent-foreground" : ""
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{item.title}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant={status.variant} className="text-[10px] py-0 px-1">
                  {status.label}
                </Badge>
                {item.tokens_used && (
                  <span className="text-[10px] text-muted-foreground">
                    {item.tokens_used.toLocaleString()} tokens
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
