"use client";

import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  onMenuToggle: () => void;
}

export function AppHeader({ onMenuToggle }: AppHeaderProps) {
  return (
    <header className="flex items-center h-14 px-4 border-b border-border bg-background shrink-0 gap-3">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuToggle}
      >
        <Menu className="w-4 h-4" />
      </Button>

      <div className="flex-1" />

      <ThemeToggle />
    </header>
  );
}
