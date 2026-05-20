"use client";

import { Plus, Trash2, MessageSquareCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onClear: () => void;
}

export function ChatSidebar({
  sessions,
  activeId,
  onSelect,
  onNew,
  onClear,
}: ChatSidebarProps) {
  return (
    <div className="w-56 border-r border-border h-full flex flex-col shrink-0">
      <div className="p-3 border-b border-border">
        <Button size="sm" className="w-full" onClick={onNew}>
          <Plus className="w-4 h-4" />
          New chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-2">
            <MessageSquareCode className="w-6 h-6 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">No conversations yet</p>
          </div>
        ) : (
          sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelect(session.id)}
              className={cn(
                "w-full text-left px-2.5 py-2 rounded-md text-xs transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                activeId === session.id
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              <p className="truncate">{session.title}</p>
              <p className="text-muted-foreground mt-0.5 text-[10px]">
                {session.timestamp.toLocaleDateString()}
              </p>
            </button>
          ))
        )}
      </div>

      {sessions.length > 0 && (
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground hover:text-destructive"
            onClick={onClear}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear history
          </Button>
        </div>
      )}
    </div>
  );
}
