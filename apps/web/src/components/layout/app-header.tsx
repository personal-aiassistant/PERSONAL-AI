"use client";

import { useEffect, useState } from "react";
import { Menu, Search } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/layout/notification-bell";
import { SearchModal } from "@/components/search/search-modal";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  onMenuToggle: () => void;
}

export function AppHeader({ onMenuToggle }: AppHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="flex items-center h-14 px-4 border-b border-border bg-background shrink-0 gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="w-4 h-4" />
        </Button>

        {/* Search bar */}
        <button
          onClick={() => setSearchOpen(true)}
          className={cn(
            "flex items-center gap-2 px-3 h-8 rounded-md border border-border bg-muted/40",
            "text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
            "w-48 sm:w-64"
          )}
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left truncate">Search...</span>
          <kbd className="hidden sm:flex items-center gap-0.5 font-mono text-xs opacity-60">
            ⌘K
          </kbd>
        </button>

        <div className="flex-1" />

        <NotificationBell />
        <ThemeToggle />
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
